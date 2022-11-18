<template>
  <div id="wrapper">
      <h1>Profile</h1>
      <a id="edit-link" href="/reset-password"><p id="edit-icon">✏️</p></a>
      <a id="sign-out-link" href="javascript:void(0)"><p id="sing-out-icon">🚪</p></a>
  </div>
</template>

<script>

import router from '../router/main';
  export default {
      name: "Home",
      data() {
      },
      mounted() {
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
      display: inline-flex;
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