let project_folder = require("path").basename(__dirname);
let source_folder = "src";

let fs = require("fs");

let path = {
	build: {
		html: project_folder + "/",
		css: project_folder + "/css/",
		js: project_folder + "/js/",
		img: project_folder + "/img/",
		fonts: project_folder + "/fonts/"
	},
	src: {
		html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
		css: source_folder + "/scss/style.scss",
		js: source_folder + "/js/script.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
		fonts: source_folder + "/fonts/*.{ttf,woff,otf,woff2,etx,eot,svg}"
	},
	watch: {
		html: source_folder + "/**/*.html",
		css: source_folder + "/scss/**/*.scss",
		js: source_folder + "/js/**/*.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}"
	},
	clean: "./" + project_folder + "/"
}

let { src, dest } = require("gulp"),
	gulp = require("gulp"),
	browser_sync = require("browser-sync").create(),
	file_include = require("gulp-file-include"),
	del = require("del"),
	scss = require("gulp-sass"),
	autoprefixer = require("gulp-autoprefixer"),
	groupMedia = require("gulp-group-css-media-queries"),
	cleanCss = require("gulp-clean-css"),
	rename = require("gulp-rename"),
	uglify = require("gulp-uglify-es").default,
	imagemin = require("gulp-imagemin"),
	webp = require("gulp-webp"),
	webpHtml = require("gulp-webp-html"),
	webpCss = require("gulp-webp-css"),
	svgSprite = require("gulp-svg-sprite"),
	ttf2woff = require("gulp-ttf2woff"),
	ttf2woff2 = require("gulp-ttf2woff2"),
	fonter = require("gulp-fonter");

function browserSync(params) {
	browser_sync.init({
		server: {
			baseDir: "./" + project_folder + "/"
		},
		port: 3000,
		notify: false
	})
}

function html() {
	return src(path.src.html)
		.pipe(file_include())
		.pipe(webpHtml())
		.pipe(dest(path.build.html))
		.pipe(browser_sync.stream())
}

function css() {
	return src(path.src.css)
		.pipe(scss({
			outputStyle: "expanded"
		}))
		.pipe(autoprefixer({
			overrideBrowserslist: ["last 5 versions"],
			cascade: true
		}))
		.pipe(groupMedia())
		.pipe(webpCss({
			webpClass: '.webp',
			noWebpClass: '.no-webp'
		}))
		.pipe(dest(path.build.css))
		.pipe(cleanCss())
		.pipe(rename({
			extname: ".min.css"
		}))
		.pipe(dest(path.build.css))
		.pipe(browser_sync.stream())
}

function js() {
	return src(path.src.js)
		.pipe(file_include())
		.pipe(dest(path.build.js))
		.pipe(uglify())
		.pipe(rename({
			extname: ".min.js"
		}))
		.pipe(dest(path.build.js))
		.pipe(browser_sync.stream())
}

function images() {
	return src(path.src.img)
		.pipe(webp({
			quality: 70
		}))
		.pipe(dest(path.build.img))
		.pipe(src(path.src.img))
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{ removeViewBox: false }],
			interlaced: true,
			optimizationLevel: 3 // 0 to 7
		}))
		.pipe(dest(path.build.img))
		.pipe(browser_sync.stream())
}

function fonts(params) {
	src(path.src.fonts)
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts));
	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts))

}

gulp.task("otf2ttf", () => {
	return src([source_folder + "/fonts/*.otf"])
		.pipe(fonter({
			formats: ["ttf"]
		}))
		.pipe(dest(source_folder + "/fonts/"))
})

gulp.task("svgSprite", async () => {
	return gulp.src([source_folder + "/iconsprite/*svg"])
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: "../icons/icons.svg", // sprite file name
					// example: true
				}
			}
		}))
		.pipe(dest(path.build.img))
});

function watchFiles(params) {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.img], images);
}

function clean(params) {
	return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
