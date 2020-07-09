let project_folder = "public";
let source_folder = "src";

let path = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/css",
        js: project_folder + "/js",
        img: project_folder + "/img",
        fonts: project_folder + "/fnt"
    },
    src: {
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        css: source_folder + "/sass/style.scss",
        js: source_folder + "/js/script.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,ico,webp}",
        fonts: source_folder + "/fnt/*.ttf"
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/sass/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,ico,webp}"
    },
    clean : "./" + project_folder
};

const {src, dest} = require('gulp');
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const del = require('del');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const gcmq = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const rename = require("gulp-rename");
const uglify = require('gulp-uglify-es').default;
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');

function browsersync(cb) {
    browserSync.init({
        server: {
            baseDir: "./" + project_folder
        }
    })
};

function html() {
    return src(path.src.html)
    .pipe(fileinclude())
    .pipe(dest(path.build.html))
    .pipe(browserSync.stream());
}

function css() {
    return src(path.src.css)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
        overrideBrowserslist: 'last 5 version',
        cascade: true
    }))
    .pipe(gcmq())
    .pipe(dest(path.build.css))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(rename({
        extname: ".min.css"
    }))
    .pipe(dest(path.build.css))
    .pipe(browserSync.stream());
}

function js() {
    return src(path.src.js)
    .pipe(fileinclude())
    .pipe(babel({
        presets: ['@babel/env']
    }))
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({
        extname: ".min.js"
    }))
    .pipe(dest(path.build.js))
    .pipe(browserSync.stream());
}

function img() {
    return src(path.src.img)
    .pipe(imagemin({
        interlaced: true,
        progressive: true,
        optimizationLevel: 5,
        svgoPlugins: [
            {
                removeViewBox: true
            }
        ]
    }))
    .pipe(dest(path.build.img))
    .pipe(browserSync.stream());
}

gulp.task('svgsprite', () => {
    return gulp.src(source_folder + "/iconsprite/*.svg")
    .pipe(svgSprite(
        {
            mode: {
                stack: {
                    sprite: "../icons/icons.svg",
                    example: true
                }
            }
        }
    ))
    .pipe(dest(project_folder + "/iconsprite/*.svg"))
})

function fonts() {
     src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts))
    return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts))
}

function watchFiles(cb) {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], img);
}

function clean() {
    return del(path.clean);
}

const build = gulp.series(clean, gulp.parallel(css, html, js, img, fonts));
const watch = gulp.parallel(build, watchFiles, browsersync);

exports.fonts = fonts;
exports.img = img;
exports.js = js;
exports.html = html;
exports.css  = css;
exports.build = build;
exports.default = watch;
exports.browsersync = browsersync;