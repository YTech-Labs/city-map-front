<template>
  <div id="wrapper">
      <h1>Профиль</h1>
      <div class="account-buttons">

      </div>
  </div>
</template>

<script>

import router from '../router/main';
  export default {
      name: "Home",
      data() {
      },
      mounted() {
        if (document.cookie.split("=")) {
          $('.account-buttons').append(`
            <a id="edit-link" href="/reset-password"><p id="edit-icon">Изменить пароль</p></a>
            <a id="sign-out-link" href="javascript:void(0)"><p id="sing-out-icon">Выйти из аккаунта</p></a>
          `)
        } else {
          $('.account-buttons').append(`
            <a id="sign-in-link" href="/sign-in"><p id="sign-in-icon">Войти в аккаунт</p></a>
          `)
        }
        $('#sign-out-link').click(() => {
          var cookies = document.cookie.split(";");

          for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
          }

          window.location.href = "/";
        })
      },
}
</script>

<style scoped>
  #wrapper {
    display: grid;
  }

  .account-buttons {
    margin-top: 1%;
  }

  #edit-link, 
  #sing-out-link {
    margin-left: 1%;
    margin-top: 0.2%;
    text-decoration: none;
  }

  #edit-icon,
  #sing-out-icon {
    font-size: 25px;
    transition: all 0.2s linear;
  }

  #edit-icon:hover,
  #sing-out-icon:hover {
    transform: translateY(-15%);
    transition: all 0.2s linear;
  }
</style>