/**
 * Safe Effects v1.0.1
 * Features: Crash Protection (auto-save), Search filtering, JSON storage, 2-column grid.
 */
(function(thisObj) {
    // --- MINI JSON POLYFILL FOR OLDER AE VERSIONS ---
    if (typeof JSON !== "object") {
        JSON = {
            parse: function(str) { return eval('(' + str + ')'); },
            stringify: function(arr) {
                var out = '[';
                for (var i = 0; i < arr.length; i++) {
                    var l = arr[i].label.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                    var t = arr[i].targetData.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                    out += '{"label":"' + l + '","targetData":"' + t + '"}';
                    if (i < arr.length - 1) out += ',';
                }
                return out + ']';
            }
        };
    }
    // ------------------------------------------------

    function buildUI(thisObj) {
        var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Safe Effects", undefined, {resizeable:true});
        myPanel.orientation = "column";
        myPanel.alignChildren = ["fill", "top"];
        myPanel.spacing = 6; 
        myPanel.margins = 8; 

        // --- Memory & Settings ---
        var sectionName = "SafeEffectsScript";
        var keyName = "ShortcutsData"; 
        
        var defaultEffects = [
            { label: "S_Shake", targetData: "S_Shake" }, // sapir anjeng
        ];
        var myEffects = [];

        if (app.settings.haveSetting(sectionName, keyName)) {
            var rawData = app.settings.getSetting(sectionName, keyName);
            try {
                myEffects = JSON.parse(rawData);
            } catch(e) {
                myEffects = defaultEffects;
            }
        } else {
            myEffects = defaultEffects;
            saveSettings(myEffects);
        }

        function saveSettings(effectsArray) {
            var jsonString = JSON.stringify(effectsArray);
            app.settings.saveSetting(sectionName, keyName, jsonString);
            if (app.preferences && app.preferences.saveToDisk) {
                app.preferences.saveToDisk();
            }
        }

        // --- Main UI Area ---
        var searchInput = myPanel.add("edittext", undefined, "");
        searchInput.alignment = ["fill", "top"];
        searchInput.helpTip = "Search shortcuts...";
        
        if (searchInput.text === "") { searchInput.text = "Search..."; }
        searchInput.onActivate = function() { if (this.text === "Search...") this.text = ""; }
        searchInput.onDeactivate = function() { if (this.text === "") this.text = "Search..."; }

        var dividerTop = myPanel.add("panel", undefined, undefined);
        dividerTop.alignment = "fill";
        dividerTop.maximumSize.height = 2;

        var btnGroup = myPanel.add("group");
        btnGroup.orientation = "column";
        btnGroup.alignChildren = ["fill", "top"];
        btnGroup.alignment = ["fill", "fill"]; 
        btnGroup.spacing = 4; 

        var dividerBottom = myPanel.add("panel", undefined, undefined);
        dividerBottom.alignment = "fill";
        dividerBottom.maximumSize.height = 2;

        var btnManage = myPanel.add("button", undefined, "⚙ Manage Shortcuts");
        btnManage.alignment = ["fill", "bottom"];

        // --- Core Functions ---
        function applySafeShortcut(targetData) {
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem) || comp.selectedLayers.length === 0) {
                alert("Please select a composition and a layer.");
                return;
            }

            if (app.project.file) { app.project.save(); } 
            else { app.project.saveWithDialog(); }

            var isPreset = targetData.toLowerCase().indexOf(".ffx") !== -1;
            var successCount = 0;

            app.beginUndoGroup("Safe Apply Shortcut");
            for (var i = 0; i < comp.selectedLayers.length; i++) {
                try {
                    if (isPreset) {
                        var presetFile = new File(targetData);
                        if (presetFile.exists) {
                            comp.selectedLayers[i].applyPreset(presetFile);
                            successCount++;
                        } else {
                            alert("Cannot find preset file:\n" + targetData);
                            break;
                        }
                    } else {
                        comp.selectedLayers[i].Effects.addProperty(targetData);
                        successCount++;
                    }
                } catch(err) {
                    $.writeln("Safe Effects Error: " + err.message); 
                }
            }
            app.endUndoGroup();

            if (successCount === 0 && !isPreset) {
                alert("Could not apply effect '" + targetData + "'. Check spelling.");
            }
        }

        function buildButtons(searchTerm) {
            while(btnGroup.children.length > 0) {
                btnGroup.remove(btnGroup.children[0]);
            }
            
            var rowGroup;
            var visibleCount = 0;
            var term = (searchTerm && searchTerm !== "Search...") ? searchTerm.toLowerCase() : "";

            for (var i = 0; i < myEffects.length; i++) {
                var itemParams = myEffects[i];
                
                if (term !== "" && itemParams.label.toLowerCase().indexOf(term) === -1) {
                    continue; 
                }

                if (visibleCount % 2 === 0) {
                    rowGroup = btnGroup.add("group");
                    rowGroup.orientation = "row";
                    rowGroup.alignChildren = ["fill", "top"];
                    rowGroup.alignment = ["fill", "top"];
                }

                (function(params) {
                    var btn = rowGroup.add("button", undefined, params.label);
                    btn.alignment = ["fill", "top"]; 
                    btn.onClick = function() {
                        applySafeShortcut(params.targetData);
                    };
                })(itemParams);
                
                visibleCount++;
            }
            myPanel.layout.layout(true);
        }

        searchInput.onChanging = function() { buildButtons(this.text); };
        buildButtons("");

        myPanel.onResizing = myPanel.onResize = function() { myPanel.layout.resize(); };

        // --- Manager Dialog ---
        btnManage.onClick = function() {
            var dialog = new Window("dialog", "Shortcut Manager");
            dialog.orientation = "column";
            dialog.alignChildren = ["fill", "top"];
            dialog.spacing = 15;
            dialog.margins = 20;
            
            var pnlDelete = dialog.add("group");
            pnlDelete.orientation = "column";
            pnlDelete.alignChildren = ["left", "top"];
            pnlDelete.spacing = 5;
            
            var titleDelete = pnlDelete.add("statictext", undefined, " Current Shortcuts ");
            
            function refreshMainListBox() {
                listBox.removeAll();
                for (var i = 0; i < myEffects.length; i++) {
                    listBox.add("item", myEffects[i].label + "  ->  " + myEffects[i].targetData);
                }
            }

            var listBox = pnlDelete.add("listbox", [0, 0, 350, 120], []);
            refreshMainListBox();
            
            var reorderGroup = pnlDelete.add("group");
            reorderGroup.orientation = "row";
            reorderGroup.alignChildren = ["fill", "top"];
            
            var btnMoveUp = reorderGroup.add("button", undefined, "Move Up");
            var btnMoveDown = reorderGroup.add("button", undefined, "Move Down");
            btnMoveUp.minimumSize.width = 170;
            btnMoveDown.minimumSize.width = 170;

            var btnDeleteSelected = pnlDelete.add("button", undefined, "[X] Delete Selected Shortcut");
            btnDeleteSelected.alignment = ["fill", "top"];
            
            btnMoveUp.onClick = function() {
                if (listBox.selection !== null) {
                    var idx = listBox.selection.index;
                    if (idx > 0) {
                        var temp = myEffects[idx];
                        myEffects[idx] = myEffects[idx - 1];
                        myEffects[idx - 1] = temp;
                        saveSettings(myEffects);
                        buildButtons(searchInput.text);
                        refreshMainListBox();
                        listBox.selection = idx - 1;
                    }
                }
            };

            btnMoveDown.onClick = function() {
                if (listBox.selection !== null) {
                    var idx = listBox.selection.index;
                    if (idx < myEffects.length - 1) {
                        var temp = myEffects[idx];
                        myEffects[idx] = myEffects[idx + 1];
                        myEffects[idx + 1] = temp;
                        saveSettings(myEffects);
                        buildButtons(searchInput.text);
                        refreshMainListBox();
                        listBox.selection = idx + 1;
                    }
                }
            };

            btnDeleteSelected.onClick = function() {
                if (listBox.selection !== null) {
                    myEffects.splice(listBox.selection.index, 1);
                    saveSettings(myEffects); 
                    buildButtons(searchInput.text);
                    refreshMainListBox();
                } else { alert("Select a shortcut to delete."); }
            };

            var dialogDivider1 = dialog.add("panel", undefined, undefined);
            dialogDivider1.alignment = "fill";
            dialogDivider1.minimumSize.height = 2;

            var pnlAdd = dialog.add("group");
            pnlAdd.orientation = "column";
            pnlAdd.alignChildren = ["fill", "top"];
            pnlAdd.spacing = 8;
            
            var titleAdd = pnlAdd.add("statictext", undefined, " Add New Shortcut ");

            var grabGroup = pnlAdd.add("group");
            grabGroup.orientation = "row";
            grabGroup.alignChildren = ["fill", "top"];
            
            var btnGrab = grabGroup.add("button", undefined, "[+] Grab Selected Effect");
            var btnBrowse = grabGroup.add("button", undefined, "[+] Browse User Preset (.ffx)");
            btnGrab.minimumSize.width = 170;
            btnBrowse.minimumSize.width = 170;
            
            var inputGroup1 = pnlAdd.add("group");
            inputGroup1.add("statictext", undefined, "Button Label:").minimumSize.width = 130;
            var labelInput = inputGroup1.add("edittext", undefined, "");
            labelInput.alignment = ["fill", "top"];

            var inputGroup2 = pnlAdd.add("group");
            inputGroup2.add("statictext", undefined, "Effect Name / Preset Path:").minimumSize.width = 130;
            var effectInput = inputGroup2.add("edittext", undefined, "");
            effectInput.alignment = ["fill", "top"];

            var btnAdd = pnlAdd.add("button", undefined, "Save New Shortcut");
            btnAdd.minimumSize.height = 30;

            var dialogDivider2 = dialog.add("panel", undefined, undefined);
            dialogDivider2.alignment = "fill";
            dialogDivider2.minimumSize.height = 2;

            var pnlBottom = dialog.add("group");
            pnlBottom.orientation = "row";
            pnlBottom.alignChildren = ["fill", "top"];

            var btnExport = pnlBottom.add("button", undefined, "Export (.safx)");
            var btnImport = pnlBottom.add("button", undefined, "Import (.safx)");
            var btnInfo = pnlBottom.add("button", undefined, "About / GitHub");
            
            btnGrab.onClick = function() {
                var comp = app.project.activeItem;
                if (!comp || comp.selectedLayers.length === 0) { alert("Select a layer first."); return; }
                
                var selectedProps = comp.selectedLayers[0].selectedProperties;
                if (selectedProps.length === 0) { alert("Click on an effect in Effect Controls to select it."); return; }
                
                var prop = selectedProps[0];
                if (prop.propertyDepth >= 2 && prop.propertyGroup(prop.propertyDepth - 1).name === "Effects") {
                    labelInput.text = prop.name; 
                    effectInput.text = prop.matchName; 
                } else {
                    alert("You didn't select an effect.");
                }
            };

            btnBrowse.onClick = function() {
                var ffxFile = File.openDialog("Select Animation Preset", "Animation Presets:*.ffx");
                if (ffxFile !== null) {
                    labelInput.text = ffxFile.displayName.replace(/\.ffx$/i, "");
                    effectInput.text = ffxFile.fsName; 
                }
            };

            btnAdd.onClick = function() {
                var labelName = labelInput.text; 
                var effectPath = effectInput.text;
                
                if (labelName === "" || effectPath === "") { alert("Please enter both fields."); return; }
                
                myEffects.push({ label: labelName, targetData: effectPath });
                saveSettings(myEffects); 
                buildButtons(searchInput.text); 
                refreshMainListBox();
                
                labelInput.text = ""; 
                effectInput.text = "";
            };

            btnExport.onClick = function() {
                if (myEffects.length === 0) { alert("You have no shortcuts to export!"); return; }
                
                var fileObj = File.saveDialog("Save your Safe Effects backup", "*.safx");
                if (fileObj) {
                    if (!fileObj.name.match(/\.safx$/i)) { fileObj = new File(fileObj.fsName + ".safx"); }
                    fileObj.open("w");
                    var secureData = "SAFE_EFFECTS_BACKUP_V1\n" + JSON.stringify(myEffects);
                    fileObj.write(secureData);
                    fileObj.close();
                    alert("Success! Backup saved.");
                }
            };

            btnImport.onClick = function() {
                var fileObj = File.openDialog("Select your Safe Effects .safx backup", "*.safx");
                if (fileObj) {
                    fileObj.open("r");
                    var rawData = fileObj.read();
                    fileObj.close();
                    
                    if (rawData.indexOf("SAFE_EFFECTS_BACKUP_V1") === 0) {
                        var cleanData = rawData.replace("SAFE_EFFECTS_BACKUP_V1\n", "");
                        try {
                            myEffects = JSON.parse(cleanData);
                            saveSettings(myEffects); 
                            buildButtons(searchInput.text);
                            refreshMainListBox();
                            alert("Backup loaded successfully!");
                        } catch(e) {
                            alert("File is corrupt or improperly formatted.");
                        }
                    } else {
                        alert("Invalid backup file.");
                    }
                }
            };

            btnInfo.onClick = function() {
                var aboutWin = new Window("dialog", "About Safe Effects");
                aboutWin.orientation = "column";
                aboutWin.alignChildren = ["center", "top"];
                aboutWin.spacing = 10;
                aboutWin.margins = 20;

                var titleText = aboutWin.add("statictext", undefined, "Safe Effects v1.0");
                
                var authorGroup = aboutWin.add("group");
                authorGroup.orientation = "row";
                authorGroup.spacing = 4;
                
                authorGroup.add("statictext", undefined, "Made by");
                
                var authorLink = authorGroup.add("statictext", undefined, "Aethmez");
                authorLink.graphics.foregroundColor = authorLink.graphics.newPen(authorLink.graphics.PenType.SOLID_COLOR, [0.3, 0.6, 1, 1], 1);
                
                authorLink.addEventListener("mousedown", function() {
                    var url = "https://www.instagram.com/aetmz/"; 
                    if ($.os.indexOf("Windows") !== -1) { system.callSystem("cmd /c \"start " + url + "\""); } 
                    else { system.callSystem("open \"" + url + "\""); }
                });

                aboutWin.add("statictext", undefined, "(Open Source & Free FOREVER. I think...)");

                var gitBtn = aboutWin.add("button", undefined, "View on GitHub");
                gitBtn.onClick = function() {
                    var url = "https://github.com/aethmez/safe-effects"; 
                    if ($.os.indexOf("Windows") !== -1) { system.callSystem("cmd /c \"start " + url + "\""); } 
                    else { system.callSystem("open \"" + url + "\""); }
                };

                aboutWin.add("button", undefined, "Close").onClick = function() { aboutWin.close(); };
                aboutWin.center();
                aboutWin.show();
            };

            dialog.center();
            dialog.show();
        };

        myPanel.layout.layout(true);
        return myPanel;
    }

    var myScriptPal = buildUI(thisObj);
    if ((myScriptPal != null) && (myScriptPal instanceof Window)) {
        myScriptPal.center();
        myScriptPal.show();
    }

})(this);
