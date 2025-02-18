---

# Fancy Arrow

---

# Demo

<div id="block1">Block 1</div>

<div v-click>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    <br />
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    <br />
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    <br />
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    <br />
</div>

<div id="block2" :class="$clicks === 0 ? 'translate-y--32' : ''">Block 2</div>

<FancyArrow x1="10" y1="20" x2="100" y2="200" color="green" width="3"  />

<FancyArrow id1="block1" pos1="bottomleft" id2="block2" pos2="topleft" color="red" width="3" rough />

<FancyArrow id1="block1" pos1="bottom" id2="block2" pos2="top" color="red" width="3" rough twoWay />

---

# Next page
