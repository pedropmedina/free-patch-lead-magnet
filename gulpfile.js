const gulp = require('gulp');
const gulpsass = require('gulp-sass');
const gulpconnect = require('gulp-connect');
const inject = require('gulp-inject');
const replace = require('gulp-replace');
// const rename = require("gulp-rename");

function sass() {
    return gulp.src('./scss/*.scss')
        .pipe(gulpsass()).on('error', gulpsass.logError)
        .pipe(gulp.dest('./css'))
        .pipe(gulpconnect.reload(() => { }));
}

function html() {
    return gulp.src('./*.html')
        .pipe(gulpconnect.reload(() => { }));
}

function connect(done) {
    gulpconnect.server({
        root: './',
        livereload: true
    }, function () { this.server.on('close', done) });
}

function watch(done) {
    gulp.watch('./scss/*.scss', sass)
    gulp.watch('./scss/_*.scss', sass)
    gulp.watch('./*.html', html)
    gulp.watch('./js/*.js', html)
    done();
}

function build() {
    return gulp.src('./index.html')
        .pipe(inject(gulp.src(['./css/main.css']), {
            starttag: '<!-- inject:head:{{ext}} -->',
            transform: function (filePath, file) {
                // return file contents as string
                return file.contents.toString('utf8')
            },
            removeTags: true
        }))
        .pipe(inject(gulp.src(['./css/main.css']), {
            starttag: '<!-- inject:hubspot_head -->',
            transform: function (filePath, file) {
                return `
                <title>{{ content.html_title }}</title>\n
                <meta name="description" content="{{ content.meta_description }}">\n
                {{ standard_header_includes }}\n
                `
            },
            removeTags: true
        }))
        .pipe(inject(gulp.src(['./css/main.css']), {
            starttag: '<!-- inject:hubspot_footer -->',
            transform: function (filePath, file) {
                return `
                {{ standard_footer_includes }}
                `
            },
            removeTags: true
        }))
        .pipe(
        replace(
            /<!-- replace:form -->(.|\n)*?<!-- end-replace -->/g, 
                        '{% module "module_1578348745710267" path="/Landing Pages/Modules/Form", label="Form" %}'
        ))
        .pipe(gulp.dest('./dist/'));
}

gulp.task('default', gulp.series(sass, gulp.parallel(connect, watch)));
gulp.task('build', gulp.parallel(build));