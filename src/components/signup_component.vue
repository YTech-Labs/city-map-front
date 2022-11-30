<template>
    <div id="wrapper">
        <div id="login-signup-links">
            <router-link class="login-signup-link" to="/sign-in">
                <p>Войти в аккаунт</p>
            </router-link>
            <router-link class="login-signup-link" to="/sign-up">
                <p>Зарегистрироваться</p>
            </router-link>
        </div>
        <h1>Регистрация</h1>
        <div id="auth-form">
            <div class="auth-wrapper">
                <input class="auth-input" type="text" name="username" placeholder="Username" required>
                <label class="auth-label" for="username"></label>
            </div>
            <div class="auth-wrapper">
                <input class="auth-input" type="password" placeholder="Password" name="password" required>
                <label class="auth-label" for="password"></label>
            </div>
            <button id="auth-check-btn">Отправить</button>
        </div>
    </div>
</template>

<script>
    import axios from "axios";

    export default {
        mounted() {

            $('.menu-icon').css('display', 'none');
            $('#auth-check-btn').click(() => {

                var data = {
                    "username": $('input[name="username"]').val(),
                    "password": $('input[name="password"]').val(),
                    "role": "001"
                };
                
                axios.post('/add-user', data)
                .then(function (response) {
                    // handle success
                   (function deleteAllCookies() {
                        var cookies = document.cookie.split(";");

                        for (var i = 0; i < cookies.length; i++) {
                            var cookie = cookies[i];
                            var eqPos = cookie.indexOf("=");
                            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
                        }
                    })();
                    document.cookie =`approved=${response.data['username']}=${response.data['role']}; SameSite=None; Secure; expires=Thu, 18 Dec 2023 12:00:00 UTC`;
                    window.location.href = "/";
                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                });
            })
        },
    }
</script>

<style>
    #auth-form {
        margin-left: 40%;
        margin-top: 15%;
        width: 200px;
        display: grid;
        justify-self: center;
        align-self: center;
    }
</style>