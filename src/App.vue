<!--主组件，所有页面在app下切换，路由是app.vue的子组件-->
<template>
    <!--路由地址-->
    <div>
      <router-view></router-view>
    </div>
</template>
<script>
  export default {
    name: 'App'
  }
</script>

<style></style>
