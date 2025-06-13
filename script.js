body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Roboto', sans-serif;
  background-color: var(--bg);
  color: var(--text);
}

:root {
  --bg: #ffffff;
  --text: #000000;
  --panel: #ffffff;
  --input: #f0f0f0;
  --border: #ccc;
}

body.dark {
  --bg: #1e1e1e;
  --text: #ffffff;
  --panel: #2c2c2c;
  --input: #3a3a3a;
  --border: #555;
}

#map {
  height: 100%;
  width: 100%;
  z-index: 0;
}

.toggle-btn {
  position: fixed;
  right: 15px;
  width: 48px;
  height: 48px;
  border: none;
  background: var(--panel);
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  cursor: pointer;
  z-index: 999;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn img {
  width: 100%;
  height: auto;
  filter: invert(0);
}
body.dark .toggle-btn img {
  filter: invert(1);
}

#search-toggle {
  top: 45%;
  transform: translateY(-50%);
}
#location-toggle {
  bottom: 110px;
}
#direction-toggle {
  bottom: 50px;
}
#dark-toggle {
  bottom: 170px;
}

.panel {
  position: fixed;
  background: var(--panel);
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  padding: 15px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 300px;
  color: var(--text);
}

#search-panel {
  top: 40%;
  right: 75px;
  transform: translateY(-50%);
  display: none;
}
#direction-panel {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: none;
}

input[type="text"] {
  padding: 10px;
  font-size: 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--input);
  color: var(--text);
}

.search-btn {
  padding: 10px;
  background-color: #1976d2;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.search-btn:hover {
  background-color: #135ca2;
}

.close-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.close-btn img {
  width: 20px;
  filter: invert(0);
}
body.dark .close-btn img {
  filter: invert(1);
}

.suggestions {
  border: 1px solid var(--border);
  border-radius: 8px;
  max-height: 150px;
  overflow-y: auto;
  background: var(--input);
  font-size: 14px;
  z-index: 1000;
  color: var(--text);
}

.suggestion {
  padding: 6px 10px;
  cursor: pointer;
}
.suggestion:hover {
  background: #e0e0e0;
}
body.dark .suggestion:hover {
  background: #444;
}

@media screen and (max-width: 600px) {
  .panel {
    width: 90%;
    left: 50%;
    transform: translateX(-50%);
  }
  #search-panel {
    right: auto;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
}
