<script>
    export let translation = "";
    export let loading = false;
  </script>
  
  <div class="widget">
    {#if loading}
      <p>Translating...</p>
    {:else}
      <p>{translation}</p>
    {/if}
  </div>
  
  <style>
    .widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px;
      background-color: white;
      border: 1px solid black;
      z-index: 1000;
    }
  </style>
  