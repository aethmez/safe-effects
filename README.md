# Safe Effects (Because After Effects Wants You To Suffer)

A dockable UI panel for After Effects that **auto-saves your project right before applying crash-prone effects.** Let's be real gng, we've **ALL** experienced the absolute heartbreak of applying `S_Shake` to an adjustment layer, only for AE to instantly freeze, panic, and nuke the last HOURS of your life (or at least mine lol).  

**Safe Effects** fixes this. By building your own custom shortcut buttons, the script forces a hard save (`app.project.save()`) a literal millisecond before the effect is applied. If Sapphire (or any other heavy plugin) decides to tank your software, your project is already backed up. Zero data loss (i hope). Just restart and keep going.

<img width="1462" height="1133" alt="Screenshot 2026-03-10 235356" src="https://github.com/user-attachments/assets/ba4ec994-a564-419e-bb72-b4533c99115f" />

## 🛡️ Core Features
* **Crash Protection:** Forces a save before applying anything.
* **1-Click Apply:** Keep your most-used (or most dangerous) tools in a custom, 2-column wrap grid.
* **Instant Search:** Quickly filter your shortcut buttons as you type.
* **Grab Selected:** Auto-fills AE's weird internal match-names. Just click an effect on your timeline and hit "Grab". No typing required.
* **Backups:** Export/Import your panel layout as a `.safx` file so you don't have to rebuild your buttons when you get a new PC.

---

## 📥 Installation

1. Download `SafeEffects.jsx` from the [Releases](../../releases) tab.
2. Put it into your AE `ScriptUI Panels` folder:
   * **Win:** `C:\Program Files\Adobe\Adobe After Effects <Version>\Support Files\Scripts\ScriptUI Panels`
   * **Mac:** `/Applications/Adobe After Effects <Version>/Scripts/ScriptUI Panels`
3. Open After Effects. **Crucial step but you've probably done it:** Go to *Preferences > Scripting & Expressions* and check the box that says **"Allow Scripts to Write Files and Access Network"**. (If you don't do this, the script can't save your buttons to your disk).
4. Launch it from **Window > SafeEffects.jsx** at the top of your screen.

---

## 🛠️ Quick Start

* **Add a Shortcut:** Click **⚙ Manage Shortcuts**. Type the effect name, OR select an effect on your layer and click **[+] Grab Selected**. Hit Save.
* **Add a Preset:** In the Manager, click **[+] Browse User Preset (.ffx)** to link an animation preset file.
* **Reorder/Delete:** Open the Manager to move buttons up/down or banish them from your grid entirely.

---

  ## Compatibility 
  
  Works on all modern versions of AE (2022+) AND legacy versions (CC 2014 – 2021) thanks to a built-in JSON fallback. (even CS6, ~according to gemini~ i've tested myself, it works)

  
  <img width="1156" height="665" alt="Screenshot 2026-03-11 094435" src="https://github.com/user-attachments/assets/c638cea3-ddda-4474-9e40-3ef1b3284be2" />
  
  > Works on Windows (Questionable on macOS)
---

  S_Shake Shortcut built-in for a reason fuck u sapir anjeng
  
  (Open Source & Free FOREVER. I think...)
  
**License:** [MIT License](LICENSE)  
