<template>
  <nav class="navigation">
    <ul>
      <li><router-link to="/">Home</router-link></li>
      <li><router-link to="upload">Upload</router-link></li>
      <li><router-link to="me">Me</router-link></li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: "NavBar",
  data() {
    return {};
  },
};
</script>

<style lang="css" scoped>
ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #333;
}

li {
  float: left;
}

li a {
  display: block;
  color: white;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
}

li a:hover {
  background-color: #111;
}
</style>