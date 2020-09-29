const db = require("../config/db");
const bcrypt = require("bcrypt");

module.exports = (app) => {
    // passport 및 local 스토리지 설정
    const passport = require("passport"),
        LocalStrategy = require("passport-local").Strategy;

    // passport 사용
    app.use(passport.initialize());
    app.use(passport.session());

    // 로그인 검증이 완료 되었을 경우
    // 로그인 검증 성공 후 세션 저장
    passport.serializeUser(function (user, done) {
        //console.log(`serializeUser`, user);
        done(null, user.id);
    });
    // 로그인 여부 체크
    passport.deserializeUser(function (id, done) {
        const user = db
            .get("users")
            .find({
                id: id,
            })
            .value();
        //console.log("deserializeUser", id, user);
        done(null, user);
    });

    // 로그인시 검증
    passport.use(
        new LocalStrategy(
            {
                usernameField: "email",
                passwordField: "pwd",
            },
            function (email, password, done) {
                console.log("LocalStrategy", email, password);
                const user = db
                    .get("users")
                    .find({
                        email: email,
                    })
                    .value();

                if (user) {
                    bcrypt.compare(password, user.password, (err, result) => {
                        if (result) {
                            return done(null, user, {
                                message: "Welcome.",
                            });
                        } else {
                            return done(null, false, {
                                message: "Password is not correct.",
                            });
                        }
                    });
                } else {
                    return done(null, false, {
                        message: "There is no email.",
                    });
                }
            }
        )
    );
    return passport;
};
