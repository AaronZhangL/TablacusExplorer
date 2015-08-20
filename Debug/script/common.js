//Tablacus Explorer

Ctrl = null;
g_temp = null;
g_sep = "` ~";
Handled = null;
hwnd = null;
pt = api.Memory("POINT");
dataObj = null;
grfKeyState = null;
pdwEffect = 0;
bDrop = null;
Input = null;
g_tidNew = null;
eventTE = { Environment: {} };
eventTA = {};
g_ptDrag = api.Memory("POINT");
objHover = null;
g_nFind = 0;
g_Colors = {};
Addons = {"_stack": []};

FolderMenu =
{
	Items: [],

	Clear: function ()
	{
		this.Items.length = 0;
	},

	Open: function (FolderItem, x, y, filter)
	{
		this.Clear();
		this.Filter = filter;
		var hMenu = api.CreatePopupMenu();
		this.OpenMenu(hMenu, FolderItem);
		window.g_menu_click = true;
		var Verb = api.TrackPopupMenuEx(hMenu, TPM_RIGHTBUTTON | TPM_RETURNCMD, x, y, te.hwnd, null, null);
		g_popup = null;
		api.DestroyMenu(hMenu);
		Verb = Verb ? this.Items[Verb - 1] : null;
		this.Clear();
		return Verb;
	},

	OpenSubMenu: function (hMenu, wID, hSubMenu)
	{
		this.OpenMenu(api.sscanf(hSubMenu, "%llx"), this.Items[wID - 1], api.sscanf(hMenu, "%llx"), wID);
	},

	OpenMenu: function (hMenu, FolderItem, hParent, wID)
	{
		if (!FolderItem) {
			return;
		}
		var path = FolderItem.Path || FolderItem;
		if (path === FolderItem || /^[A-Z]:\\$/i.test(path)) {
			FolderItem = api.ILCreateFromPath(path);
		}
		try {
			if (!FolderItem || FolderItem.IsBrowsable) {
				FolderItem = {};
			}
			var bSep = false;
			if (!api.ILIsEmpty(FolderItem)) {
				this.AddMenuItem(hMenu, api.ILRemoveLastID(FolderItem, true), "../");
				bSep = true;
			}
			var Folder = FolderItem.GetFolder;
			if (Folder) {
				var Items = Folder.Items();
				if (Items) {
					var nCount = Items.Count;
					for (var i = 0; i < nCount; i++) {
						var Item = Items.Item(i);
						var bMatch = Item.IsFolder;
						if (this.Filter) {
							var s = Item.Name;
							if (bMatch && IsFolderEx(Item)) {
								s += ".folder";
							}
							bMatch = api.PathMatchSpec(s, this.Filter);
						}
						if (bMatch) {
							if (bSep) {
								api.InsertMenu(hMenu, MAXINT, MF_BYPOSITION | MF_SEPARATOR, 0, null);
								bSep = false;
							}
							this.AddMenuItem(hMenu, Item);
							wID = null;
						}
					}
				}
			}
			if (hParent && wID) {
				var mii = api.Memory("MENUITEMINFO");
				mii.cbSize = mii.Size;
				mii.fMask = MIIM_SUBMENU | MIIM_FTYPE;
				api.GetMenuItemInfo(hParent, wID, false, mii);
				mii.hSubMenu = 0;
				mii.fType = mii.fType & ~MF_POPUP;
				api.SetMenuItemInfo(hParent, wID, false, mii);
				api.DestroyMenu(hMenu);
			}
		} catch (e) {}
	},

	AddMenuItem: function (hMenu, FolderItem, Name, bSelect)
	{
		var mii = api.Memory("MENUITEMINFO");
		mii.cbSize = mii.Size;
		mii.fMask = MIIM_ID | MIIM_STRING | MIIM_BITMAP | MIIM_SUBMENU;
		if (bSelect && Name) {
			mii.dwTypeData = Name;
		} else {
			mii.dwTypeData = (Name ? Name + api.GetDisplayNameOf(FolderItem, SHGDN_INFOLDER) : api.GetDisplayNameOf(FolderItem, SHGDN_INFOLDER));
		}
		AddMenuIconFolderItem(mii, FolderItem);
		this.Items.push(FolderItem);
		mii.wID = this.Items.length;
		if (!bSelect && api.GetAttributesOf(FolderItem, SFGAO_HASSUBFOLDER | SFGAO_BROWSABLE) == SFGAO_HASSUBFOLDER) {
			var path = api.GetDisplayNameOf(FolderItem, SHGDN_FORADDRESSBAR | SHGDN_FORPARSING);
			mii.hSubMenu = api.CreatePopupMenu();
			api.InsertMenu(mii.hSubMenu, 0, MF_BYPOSITION | MF_STRING, 0, api.sprintf(99, '\tJScript\tFolderMenu.OpenSubMenu("%llx",%d,"%llx")', hMenu, mii.wID, mii.hSubMenu));
		}
		api.InsertMenuItem(hMenu, MAXINT, false, mii);
	},

	Invoke: function (FolderItem)
	{
		if (FolderItem) {
			switch (window.g_menu_button - 0) {
				case 2:
					PopupContextMenu(FolderItem);
					break;
				case 3:
					Navigate(FolderItem, SBSP_NEWBROWSER);
					break;
				default:
					Navigate(FolderItem, OpenMode);
					break;
			}
		}
	}
};

AddEvent = function (Name, fn, priority)
{
	if (Name) {
		Name = Name.replace("Dragleave", "DragLeave");
		if (Name == "ItemPrePaint" && !te.OnItemPrePaint) {
			te.OnItemPrePaint = function (Ctrl, pid, nmcd, vcd, plRes)
			{
				RunEvent3("ItemPrePaint", Ctrl, pid, nmcd, vcd, plRes);
			}
		}

		if (!eventTE[Name]) {
			eventTE[Name] = [];
		}
		if (!eventTA[Name]) {
			eventTA[Name] = [];
		}
		if (priority) {
			eventTE[Name].unshift(fn);
			eventTA[Name].unshift(window.Error_source);
		} else {
			eventTE[Name].push(fn);
			eventTA[Name].push(window.Error_source);
		}
	}
}

AddEnv = function (Name, fn)
{
	eventTE.Environment[Name.toLowerCase()] = fn;
}

function ApplyLang(doc)
{
	var FaceName = MainWindow.DefaultFont.lfFaceName;
	if (doc.body) {
		doc.body.style.fontFamily = FaceName;
		doc.body.style.fontSize = Math.abs(MainWindow.DefaultFont.lfHeight) + "px";
		doc.body.style.backgroundColor = 'buttonface';
		var css = document.styleSheets.item(0);
		if (css) {
			var s = ['font-family: ', FaceName, '; font-size: ', doc.body.style.fontSize].join("");
			if (css.insertRule) {
				css.insertRule(["*", " { ", s, " }"].join(""), css.cssRules.length);
			}
			else if (css.addRule) {
				css.addRule("*", s);
			}
		}
	}

	var i;
	var Lang = MainWindow.Lang;
	var o = doc.getElementsByTagName("a");
	if (o) {
		for (i = o.length; i--;) {
			var s = Lang[o[i].innerHTML.replace(/&amp;/ig, "&")];
			if (!s) {
				s = o[i].innerHTML;
			}
			o[i].innerHTML = amp2ul(s);
			var s = Lang[o[i].title];
			if (s) {
				o[i].title = s;
			}
			var s = Lang[o[i].alt];
			if (s) {
				o[i].alt = s;
			}
		}
	}
	var h = 0;
	var o = doc.getElementsByTagName("input");
	if (o) {
		for (i = o.length; i--;) {
			if (!h && o[i].type == "text") {
				h = o[i].offsetHeight * screen.deviceYDPI / screen.logicalYDPI;
			}
			var s = Lang[o[i].placeholder];
			if (s) {
				o[i].placeholder = s;
			}
			var s = Lang[o[i].title];
			if (s) {
				o[i].title = s;
			}
			var s = Lang[o[i].alt];
			if (s) {
				o[i].alt = s;
			}
			if (o[i].type == "button") {
				s = Lang[o[i].value];
				if (s) {
					o[i].value = s;
				}
			}
			var s = ImgBase64(o[i], 0);
			if (s != "") {
				o[i].src = s;
				if (o[i].type == "text" && s != "") {
					o[i].style.backgroundImage = "url('" + s + "')";
				}
			}
		}
	}
	var o = doc.getElementsByTagName("img");
	if (o) {
		for (i = o.length; i--;) {
			var s = Lang[o[i].title];
			if (s) {
				o[i].title = delamp(s);
			}
			var s = Lang[o[i].alt];
			if (s) {
				o[i].alt = delamp(s);
			}
			var s = ImgBase64(o[i], 0);
			if (s != "") {
				o[i].src = s;
			}
			if (!o[i].ondragstart) {
				o[i].draggable = false;
			}
		}
	}
	var o = doc.getElementsByTagName("select");
	if (o) {
		for (i = o.length; i--;) {
			var s = Lang[o[i].title];
			if (s) {
				o[i].title = delamp(s);
			}
			for (var j = 0; j < o[i].length; j++) {
				var s = Lang[o[i][j].text.replace(/^\n/, "").replace(/\n$/, "")];
				if (s) {
					o[i][j].text = s;
				}
			}
		}
	}
	var o = doc.getElementsByTagName("label");
	if (o) {
		for (i = o.length; i--;) {
			var s = Lang[o[i].innerHTML.replace(/&amp;/ig, "&")];
			if (!s) {
				s = o[i].innerHTML;
			}
			o[i].innerHTML = amp2ul(s);
			var s = Lang[o[i].title];
			if (s) {
				o[i].title = s;
			}
			var s = Lang[o[i].alt];
			if (s) {
				o[i].alt = s;
			}
		}
	}
	var o = doc.getElementsByTagName("button");
	if (o) {
		for (i = o.length; i--;) {
			var s = Lang[o[i].innerHTML.replace(/&amp;/ig, "&")];
			if (!s) {
				s = o[i].innerHTML;
			}
			o[i].innerHTML = amp2ul(s);
			var s = Lang[o[i].title];
			if (s) {
				o[i].title = s;
			}
			var s = Lang[o[i].alt];
			if (s) {
				o[i].alt = s;
			}
		}
	}
	var o = doc.getElementsByTagName("textarea");
	if (o) {
		for (i = o.length; i--;) {
			o[i].onkeydown = InsertTab;
		}
	}

	var o = doc.getElementsByTagName("li");
	if (o) {
		for (i = o.length; i--;) {
			var s = Lang[o[i].innerHTML.replace(/&amp;/ig, "&")];
			if (!s) {
				s = o[i].innerHTML;
			}
			o[i].innerHTML = amp2ul(s);
		}
	}

	var o = doc.getElementsByTagName("form");
	if (o) {
		for (i = o.length; i--;) {
			o[i].onsubmit = function () { return false };
		}
	}

	doc.title = GetText(doc.title);
	setTimeout(function ()
	{
		var hwnd = api.GetParent(api.GetWindow(doc));
		var s = api.GetWindowText(hwnd);
		if (/ \-+ .*$/.test(s)) {
			api.SetWindowText(hwnd, s.replace(/ \-+ .*$/, ""));
		}
	}, 500);
}

function amp2ul(s)
{
	s = s.replace(/&amp;/ig, "&");
	if (/@.*\..*,\-?\d+/.test(s)) {
		var lk = wsh.CreateShortCut(".lnk")
		lk.Description = s;
		s = lk.Description;
	}
	return /;/.test(s) ? s : s.replace(/&(.)/ig, "<u>$1</u>");
}

function delamp(s)
{
	s = s.replace(/&amp;/ig, "&");
	return /;/.test(s) ? s : s.replace(/&/ig, "");
}

function ImgBase64(o, index)
{
	var src = ExtractMacro(te, o.src);
	var s = MakeImgSrc(src, index, false, o.height, o.getAttribute("bitmap"), o.getAttribute("icon"));
	if (s) {
		o.removeAttribute("bitmap");
		o.removeAttribute("icon");
	} else if (o.src.toLowerCase() != src.toLowerCase()) {
		return src.replace(location.href.replace(/[^\/]*$/, ""), "file:///");
	}
	return s;
}

function MakeImgSrc(src, index, bSrc, h, strBitmap, strIcon)
{
	var fn;
	if (!document.documentMode) {
		var value = /^bitmap:(.*)/i.test(src) ? RegExp.$1 : strBitmap;
		if (value) {
			fn = fso.BuildPath(te.Data.DataFolder, "cache\\bitmap\\" + value.replace(/[:\\\/]/g, "$") + ".png");
		} else {
			value = /^icon:(.*)/i.test(src) ? RegExp.$1 : strIcon;
			if (value) {
				fn = fso.BuildPath(te.Data.DataFolder, "cache\\icon\\" + value.replace(/[:\\\/]/g, "$") + ".png");
			} else if (src && !REGEXP_IMAGE.test(src)) {
				src = src.replace(/^file:\/\/\//i, "").replace(/\//g, "\\");
				fn = fso.BuildPath(te.Data.DataFolder, "cache\\file\\" + src.replace(/[:\\\/]/g, "$") + ".png");
			}
		}
		if (fn && fso.FileExists(fn)) {
			return fn;
		}
	}
	src = ExtractMacro(te, src);
	var image = MakeImgData(src, index, h, strBitmap, strIcon);
	if (image) {
		if (document.documentMode) {
			return image.DataURI("image/png");
		}
		if (fn) {
			try {
				image.Save(fn);
			} catch (e) {}
			return fn;
		}
	}
	return bSrc ? src : "";
}

function MakeImgData(src, index, h, strBitmap, strIcon)
{
	var hIcon = MakeImgIcon(src, index, h, strBitmap, strIcon);
	if (hIcon) {
		var image = te.GdiplusBitmap();
		image.FromHICON(hIcon, GetSysColor(COLOR_BTNFACE));
		api.DestroyIcon(hIcon);
		return image;
	}
	return null;
}

function MakeImgIcon(src, index, h, strBitmap, strIcon)
{
	var hIcon = null;
	var value = /^bitmap:(.*)/i.test(src) ? RegExp.$1 : strBitmap;
	if (value) {
		var icon = value.split(",");
		var hModule = LoadImgDll(icon, index);
		if (hModule) {
			var himl = api.ImageList_LoadImage(hModule, isFinite(icon[index * 4 + 1]) ? Number(icon[index * 4 + 1]) : icon[index * 4 + 1], icon[index * 4 + 2], 0, CLR_DEFAULT, IMAGE_BITMAP, LR_CREATEDIBSECTION);
			if (himl) {
				hIcon = api.ImageList_GetIcon(himl, icon[index * 4 + 3], ILD_NORMAL);
				api.ImageList_Destroy(himl);
			}
			api.FreeLibrary(hModule);
			return hIcon;
		}
	}
	value = /^icon:(.*)/i.test(src) ? RegExp.$1 : strIcon;
	if (value) {
		var icon = value.split(",");
		var phIcon = api.Memory("HANDLE");
		if (icon[index * 4 + 2] > 16) {
			api.ExtractIconEx(icon[index * 4], icon[index * 4 + 1], phIcon, null, 1);
		} else {
			api.ExtractIconEx(icon[index * 4], icon[index * 4 + 1], null, phIcon, 1);
		}
		if (phIcon[0]) {
			return phIcon[0];
		}
	}
	if (src && !REGEXP_IMAGE.test(src)) {
		var info = api.Memory("SHFILEINFO");
		var pidl = api.ILCreateFromPath(api.PathUnquoteSpaces(src));
		if (pidl) {
			api.ShGetFileInfo(pidl, 0, info, info.Size, (h && h <= 16) ? SHGFI_PIDL | SHGFI_ICON | SHGFI_SMALLICON : SHGFI_PIDL | SHGFI_ICON);
			return info.hIcon;
		}
	}
	return null;
}

LoadImgDll = function (icon, index)
{
	var hModule = api.LoadLibraryEx(fso.BuildPath(system32, icon[index * 4]), 0, LOAD_LIBRARY_AS_DATAFILE);
	if (!hModule && icon[index * 4].toLowerCase() == "ieframe.dll") {
		if (icon[index * 4 + 1] >= 500) {
			hModule = api.LoadLibraryEx(fso.BuildPath(system32, "browseui.dll"), 0, LOAD_LIBRARY_AS_DATAFILE);
		} else if (WINVER > 0x500) {
			hModule = api.LoadLibraryEx(fso.BuildPath(system32, "shell32.dll"), 0, LOAD_LIBRARY_AS_DATAFILE);
		} else {
			hModule = api.LoadLibraryEx(fso.BuildPath(system32, "browseui.dll"), 0, LOAD_LIBRARY_AS_DATAFILE);
			icon[index * 4 + 1] = (icon[index * 4 + 1] < 210 ? 62 : 63) + (icon[index * 4 + 1] & ~1);
			if (icon[index * 4 + 2] > 20) {
				icon[index * 4 + 2] = 20;
			}
		}
	}
	return hModule;
}

GetText = function (id)
{
	try {
		id = id.replace(/&amp;/g, "&");
		var s = MainWindow.Lang[id];
		if (s) {
			return s;
		}
	} catch (e) {}
	return id;
}

function LoadLang2(filename)
{
	var xml = te.CreateObject("Msxml2.DOMDocument");
	xml.async = false;
	if (fso.FileExists(filename)) {
		xml.load(filename);
		var items = xml.getElementsByTagName('text');
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			SetLang2(item.getAttribute("s").replace("\\t", "\t").replace("\\n", "\n"), item.text.replace("\\t", "\t").replace("\\n", "\n"));
		}
	}
}

SetLang2 = function(s, v)
{
	if (!MainWindow.Lang[s] && !MainWindow.LangSrc[v]) {
		MainWindow.Lang[s] = v;
		MainWindow.LangSrc[v] = s;
		if (/&/.test(s)) {
			SetLang2(s.replace(/\(&\w\)|&/, ""), v.replace(/\(&\w\)|&/, ""));
		}
		if (/\.\.\.$/.test(s)) {
			SetLang2(StripAmp(s), StripAmp(v));
		}
	}
}

LoadXml = function (filename)
{
	te.LockUpdate();
	var cTC = te.Ctrls(CTRL_TC);
	for (i in cTC) {
		cTC[i].Close();
	}
	var xml = filename;
	if (typeof(filename) == "string" && fso.FileExists(filename)) {
		var xml = te.CreateObject("Msxml2.DOMDocument");
		xml.async = false;
		xml.load(filename);
	}
	var items = xml.getElementsByTagName('Ctrl');
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		switch(item.getAttribute("Type") - 0) {
			case CTRL_TC:
				var TC = te.CreateCtrl(CTRL_TC, item.getAttribute("Left"), item.getAttribute("Top"), item.getAttribute("Width"), item.getAttribute("Height"), item.getAttribute("Style"), item.getAttribute("Align"), item.getAttribute("TabWidth"), item.getAttribute("TabHeight"));
				TC.Data.Group = Number(item.getAttribute("Group")) || 0;
				var tabs = item.getElementsByTagName('Ctrl');
				for (var i2 = 0; i2 < tabs.length; i2++) {
					var tab = tabs[i2];
					var Path = tab.getAttribute("Path");
					var logs = tab.getElementsByTagName('Log');
					var nLogCount = logs.length;
					if (nLogCount > 1) {
						Path = te.FolderItems();
						for (var i3 = 0; i3 < nLogCount; i3++) {
							Path.AddItem(logs[i3].getAttribute("Path"));
						}
						Path.Index = tab.getAttribute("LogIndex");
					}
					var FV = TC.Selected.Navigate2(Path, SBSP_NEWBROWSER, tab.getAttribute("Type"), tab.getAttribute("ViewMode"), tab.getAttribute("FolderFlags"), tab.getAttribute("Options"), tab.getAttribute("ViewFlags"), tab.getAttribute("IconSize"), tab.getAttribute("Align"), tab.getAttribute("Width"), tab.getAttribute("Flags"), tab.getAttribute("EnumFlags"), tab.getAttribute("RootStyle"), tab.getAttribute("Root"), tab.getAttribute("SizeFormat"));
					FV.FilterView = tab.getAttribute("FilterView");
					FV.Data.Lock = api.QuadPart(tab.getAttribute("Lock")) != 0;
					Lock(TC, i2, false);
				}
				TC.SelectedIndex = item.getAttribute("SelectedIndex");
				TC.Visible = api.QuadPart(item.getAttribute("Visible"));
				break;
		}
	}
	MainWindow.RunEvent1("LoadWindow", xml);
	te.UnlockUpdate();
}

SaveXml = function (filename, all)
{
	var xml = CreateXml();
	var root = xml.createElement("TablacusExplorer");

	if (all) {
		var item = xml.createElement("Window");
		var CmdShow = SW_SHOWNORMAL;
		var hwnd = te.hwnd;
		if (api.IsZoomed(hwnd)) {
			CmdShow = SW_SHOWMAXIMIZED;
		}
		api.ShowWindow(hwnd, SW_SHOWNORMAL);
		var rc = api.Memory("RECT");
		api.GetWindowRect(hwnd, rc);
		item.setAttribute("Left", rc.left);
		item.setAttribute("Top", rc.top);
		item.setAttribute("Width", rc.right - rc.left);
		item.setAttribute("Height", rc.bottom - rc.top);
		item.setAttribute("CmdShow", CmdShow);
		root.appendChild(item);
		item = null;
	}
	var cTC = te.Ctrls(CTRL_TC);
	for (var i in cTC) {
		var Ctrl = cTC[i];
		var item = xml.createElement("Ctrl");
		item.setAttribute("Type", Ctrl.Type);
		item.setAttribute("Left", Ctrl.Left);
		item.setAttribute("Top", Ctrl.Top);
		item.setAttribute("Width", Ctrl.Width);
		item.setAttribute("Height", Ctrl.Height);
		item.setAttribute("Style", Ctrl.Style);
		item.setAttribute("Align", Ctrl.Align);
		item.setAttribute("TabWidth", Ctrl.TabWidth);
		item.setAttribute("TabHeight", Ctrl.TabHeight);
		item.setAttribute("SelectedIndex", Ctrl.SelectedIndex);
		item.setAttribute("Visible", api.QuadPart(Ctrl.Visible));
		item.setAttribute("Group", api.QuadPart(Ctrl.Data.Group));

		var bEmpty = true;
		var nCount2 = Ctrl.Count;
		for (var i2 in Ctrl) {
			var FV = Ctrl[i2];
			var path = GetSavePath(FV.FolderItem);
			var bSave = !all || IsSavePath(path);
			if (bSave || (bEmpty && i2 == nCount2 - 1)) {
				if (!bSave) {
					path = HOME_PATH;
				}
				var item2 = xml.createElement("Ctrl");
				item2.setAttribute("Type", FV.Type);
				item2.setAttribute("Path", path);
				item2.setAttribute("FolderFlags", FV.FolderFlags);
				item2.setAttribute("ViewMode", FV.CurrentViewMode);
				item2.setAttribute("IconSize", FV.IconSize);
				item2.setAttribute("Options", FV.Options);
				item2.setAttribute("SizeFormat", FV.SizeFormat);
				item2.setAttribute("ViewFlags", FV.ViewFlags);
				item2.setAttribute("FilterView", FV.FilterView);
				item2.setAttribute("Lock", api.QuadPart(FV.Data.Lock));
				var TV = FV.TreeView;
				item2.setAttribute("Align", TV.Align);
				item2.setAttribute("Width", TV.Width);
				item2.setAttribute("Flags", TV.Style);
				item2.setAttribute("EnumFlags", TV.EnumFlags);
				item2.setAttribute("RootStyle", TV.RootStyle);
				item2.setAttribute("Root", String(TV.Root));
				var TL = FV.History;
				if (TL) {
					if (TL.Count > 1) {
						var bLogSaved = false;
						var nLogIndex = TL.Index;
						for (var i3 in TL) {
							path = GetSavePath(TL[i3]);
							if (IsSavePath(path)) {
								var item3 = xml.createElement("Log");
								item3.setAttribute("Path", path);
								item2.appendChild(item3);
								bLogSaved = true;
							} else if (i3 < nLogIndex) {
								nLogIndex--;
							}
						}
						if (bLogSaved) {
							item2.setAttribute("LogIndex", nLogIndex);
						}
					}
				}
				item.appendChild(item2);
				bEmpty = false;
			}
		}
		root.appendChild(item);
	}
	if (all) {
		for (var i in te.Data) {
			if (/^(Tab|Tree|View|Conf)_(.*)/.test(i)) {
				var item = xml.createElement(RegExp.$1);
				item.setAttribute("Id", RegExp.$2);
				item.text = te.Data[i];
				if (item.text != "") {
					root.appendChild(item);
				}
			}
		}
	}
	MainWindow.RunEvent1("SaveWindow", xml, root, all);
	xml.appendChild(root);
	try {
		xml.save(filename);
	} catch (e) {
		if (e.number != E_ACCESSDENIED) {
			ShowError(e, "Save: " + filename);
		}
	}
}

GetKeyKey = function (strKey)
{
	var nShift = api.sscanf(strKey, "$%x");
	if (nShift) {
		return nShift;
	}
	strKey = strKey.toUpperCase();
	for (var j in MainWindow.g_KeyState) {
		var s = MainWindow.g_KeyState[j][0].toUpperCase() + "+";
		if (strKey.match(s)) {
			strKey = strKey.replace(s, "");
			nShift |= MainWindow.g_KeyState[j][1];
		}
	}
	return nShift | MainWindow.g_KeyCode[strKey];
}

GetKeyName = function (strKey)
{
	var nKey = api.sscanf(strKey, "$%x");
	if (nKey) {
		var s = api.GetKeyNameText((nKey & 0x17f) << 16);
		if (s) {
			var arKey = [];
			for (var j in MainWindow.g_KeyState) {
				if (nKey & MainWindow.g_KeyState[j][1]) {
					nKey -= MainWindow.g_KeyState[j][1];
					arKey.push(MainWindow.g_KeyState[j][0]);
				}
			}
			if (GetKeyKey(s) == nKey) {
				arKey.push(s);
				return arKey.join("+");
			}
		}
	}
	return strKey;
}

GetKeyShift = function ()
{
	var nShift = 0;
	var n = 0x1000;
	var vka = [VK_SHIFT, VK_CONTROL, VK_MENU, VK_LWIN];
	for (var i in vka) {
		if (api.GetKeyState(vka[i]) < 0) {
			nShift += n;
		}
		n *= 2;
	}
	return nShift;
}

function SetKeyData(mode, strKey, path, type, km, o)
{
	var s = "";
	if (!o) {
		o = te.Data;
		s = km;
	}
	if (km == "Key") {
		o[s + mode][GetKeyKey(strKey)] = [path, type];
	} else {
		o[s + mode][strKey] = [path, type];
	}
}

function SendShortcutKeyFV(Key)
{
	var FV = te.Ctrl(CTRL_FV);
	if (FV) {
		var KeyState = api.Memory("KEYSTATE");
		api.GetKeyboardState(KeyState);
		var KeyCtrl = KeyState.Read(VK_CONTROL, VT_UI1);
		KeyState.Write(VK_CONTROL, VT_UI1, 0x80);
		api.SetKeyboardState(KeyState);
		FV.TranslateAccelerator(0, WM_KEYDOWN, Key.charCodeAt(0), 0);
		FV.TranslateAccelerator(0, WM_KEYUP, Key.charCodeAt(0), 0);
		KeyState.Write(VK_CONTROL, VT_UI1, KeyCtrl);
		api.SetKeyboardState(KeyState);
	}
}

CreateTab = function ()
{
	var FV = te.Ctrl(CTRL_FV);
	Navigate(HOME_PATH ? HOME_PATH : FV, SBSP_NEWBROWSER);
}

Navigate = function (Path, wFlags)
{
	var FV = te.Ctrl(CTRL_FV);
	if (!FV) {
		var TC = te.CreateCtrl(CTRL_TC, 0, 0, "100%", "100%", te.Data.Tab_Style, te.Data.Tab_Align, te.Data.Tab_TabWidth, te.Data.Tab_TabHeight);
		FV = TC.Selected;
	}
	NavigateFV(FV, Path, wFlags);
}

NavigateFV = function (FV, Path, wFlags)
{
	if (FV) {
		var Focus = null;
		if (typeof(Path) == "string") {
			if (/%([^%]+)%/.test(Path)) {
				Path = ExtractMacro(FV, Path);
			}
			if (/\?|\*/.test(Path) && !/\\\\\?\\|:/.test(Path)) {
				FV.FilterView = Path;
				FV.Refresh();
				return;
			}
			Path = ExtractPath(FV, Path);
		}
		if (FV.Data.Lock) {
			wFlags |= SBSP_NEWBROWSER;
		}
		FV.Navigate(Path, wFlags);
		FV.Focus();
	}
}

IsDrag = function (pt1, pt2)
{
	if (pt1 && pt2) {
		try {
			return (Math.abs(pt1.x - pt2.x) > api.GetSystemMetrics(SM_CXDRAG) | Math.abs(pt1.y - pt2.y) > api.GetSystemMetrics(SM_CYDRAG));
		} catch (e) {}
	}
	return false;
}

ChangeTab = function (TC, nMove)
{
	var nCount = TC.Count;
	TC.SelectedIndex = (TC.SelectedIndex + nCount + nMove) % nCount;
}

ShowOptions = function (s)
{
	try {
		var dlg = g_dlgs.Options;
		if (dlg) {
			dlg.Window.SetTab(s);
			dlg.Focus();
			return;
		}
	} catch (e) {}
	g_dlgs.Options = ShowDialog("options.html",
	{
		Data: s, event:
		{
			onbeforeunload: function () 
			{
				delete MainWindow.g_dlgs.Options;
			}
		}
	})
}

ShowDialog = function (fn, opt)
{
	opt.opener = window;
	if (!/:/.test(fn)) {
		fn = location.href.replace(/[^\/]*$/, fn);
	}
	var r = Math.abs(MainWindow.DefaultFont.lfHeight) / 12;
	return te.CreateCtrl(CTRL_SW, fn, opt, document, (opt.width || 640) * r, (opt.height || 480) * r);
}

LoadLayout = function ()
{
	var commdlg = te.CommonDialog();
	commdlg.InitDir = fso.BuildPath(te.Data.DataFolder, "layout");
	commdlg.Filter = "XML Files|*.xml|All Files|*.*";
	commdlg.Flags = OFN_FILEMUSTEXIST;
	if (commdlg.ShowOpen()) {
		LoadXml(commdlg.FileName);
	}
	return S_OK;
}

SaveLayout = function ()
{
	var commdlg = te.CommonDialog();
	commdlg.InitDir = fso.BuildPath(te.Data.DataFolder, "layout");
	commdlg.Filter = "XML Files|*.xml|All Files|*.*";
	commdlg.DefExt = "xml";
	commdlg.Flags = OFN_OVERWRITEPROMPT;
	if (commdlg.ShowSave()) {
		SaveXml(commdlg.FileName);
	}
	return S_OK;
}

GetPos = function (o, bScreen, bAbs, bPanel)
{
	var x = (bScreen ? screenLeft : 0);
	var y = (bScreen ? screenTop : 0);

	while (o) {
		if (bAbs || !bPanel || api.StrCmpI(o.style.position, "absolute")) {
			x += o.offsetLeft - (bAbs ? 0 : o.scrollLeft);
			y += o.offsetTop - (bAbs ? 0 : o.scrollTop);
			o = o.offsetParent;
		} else {
			break;
		}
	}
	var pt = api.Memory("POINT");
	pt.x = x * screen.deviceXDPI / screen.logicalXDPI;
	pt.y = y * screen.deviceYDPI / screen.logicalYDPI;
	return pt;
}

HitTest = function (o, pt)
{
	if (o) {
		var p = GetPos(o, true);
		if (pt.x >= p.x && pt.x < p.x + o.offsetWidth && pt.y >= p.y && pt.y < p.y + o.offsetHeight * screen.deviceYDPI / screen.logicalYDPI) {
			o = o.offsetParent;
			p = GetPos(o, true, true);
			return pt.x >= p.x && pt.x < p.x + o.offsetWidth * screen.deviceXDPI / screen.logicalXDPI && pt.y >= p.y && pt.y < p.y + o.offsetHeight * screen.deviceYDPI / screen.logicalYDPI;
		}
	}
	return false;
}

DeleteItem = function (path)
{
	api.SHFileOperation(FO_DELETE, path, null, FOF_SILENT | FOF_NOCONFIRMATION, false);
}

IsExists = function (path)
{
	var wfd = api.Memory("WIN32_FIND_DATA");
	var hFind = api.FindFirstFile(path, wfd);
	api.FindClose(hFind);
	return hFind != INVALID_HANDLE_VALUE;
}

CreateNew = function (path, fn)
{
	clearTimeout(g_tidNew);
	if (fn && !IsExists(path)) {
		try {
			fn(path);
		} catch (e) {
			if (/^[A-Z]:\\|^\\/i.test(path)) {
				var s = fso.BuildPath(fso.GetSpecialFolder(2).Path, fso.GetFileName(path));
				DeleteItem(s);
				fn(s);
				var o = sha.NameSpace(fso.GetParentFolderName(path));
				if (o) {
					o.MoveHere(s, FOF_SILENT | FOF_NOCONFIRMATION);
				}
			}
		}
	}
	g_tidNew = setTimeout(function ()
	{
		var FV = te.Ctrl(CTRL_FV);
		if (FV) {
			if (api.ILIsEqual(FV, fso.GetParentFolderName(path))) {
				var FolderItem = api.ILCreateFromPath(path);
				FV.SelectItem(FolderItem, SVSI_SELECT | SVSI_DESELECTOTHERS | SVSI_ENSUREVISIBLE | SVSI_FOCUSED | SVSI_NOTAKEFOCUS);
			}
		}
	}, 1000);
}

CreateFolder = function (path)
{
	CreateNew(path, function (strPath)
	{
		fso.CreateFolder(strPath);
	});
}

CreateFile = function (path)
{
	CreateNew(path, function (strPath)
	{
		fso.CreateTextFile(strPath).Close();
	});
}

CreateFolder2 = function (path)
{
	if (!fso.FolderExists(path)) {
		CreateFolder(path);
	}
}

GetConsts = function (s)
{
	var Result = window[s.replace(/\s/, "")];
	if (Result !== undefined) {
		return Result;
	}
	return s;
}

Navigate2 = function (path, NewTab)
{
	var a = path.toString().split("\n");
	for (var i in a) {
		var s = a[i].replace(/^\s+/, "");
		if (s != "") {
			Navigate(s, NewTab);
			NewTab |= SBSP_NEWBROWSER;
		}
	}
}

ExecOpen = function (Ctrl, s, type, hwnd, pt, NewTab)
{
	var line = s.split("\n");
	for (var i = 0; i < line.length; i++) {
		if (line[i] != "") {
			Navigate(ExtractPath(Ctrl, line[i], pt), NewTab);
			NewTab |= SBSP_NEWBROWSER;
		}
	}
	return S_OK;
}

DropOpen = function (Ctrl, s, type, hwnd, pt, dataObj, grfKeyState, pdwEffect, bDrop)
{
	var line = s.split("\n");
	var hr = E_FAIL;
	var path = ExtractPath(Ctrl, line[0], pt);
	if (!api.ILIsEqual(dataObj.Item(-1), path)) {
		var DropTarget = api.DropTarget(path);
		if (DropTarget) {
			if (!pdwEffect) {
				pdwEffect = dataObj.pdwEffect;
			}
			pdwEffect[0] = DROPEFFECT_COPY | DROPEFFECT_MOVE | DROPEFFECT_LINK;
			hr = bDrop ? DropTarget.Drop(dataObj, grfKeyState, pt, pdwEffect) : DropTarget.DragOver(dataObj, grfKeyState, pt, pdwEffect);
		}
	}
	return hr;
}

Exec = function (Ctrl, s, type, hwnd, pt, dataObj, grfKeyState, pdwEffect, bDrop)
{
	if (s === "") {
		return S_FALSE;
	}
	window.Ctrl = Ctrl;
	window.hwnd = hwnd;
	window.dataObj = dataObj;
	window.grfKeyState = grfKeyState;
	window.pdwEffect = pdwEffect;
	window.bDrop = bDrop;
	if (pt) {
		window.pt = pt;
		te.Data.pt = pt;
	} else {
		window.pt = te.Data.pt;
	}
	window.Handled = S_OK;
	window.FV = GetFolderView(Ctrl, pt);

	if (api.StrCmpI(type, "Func") == 0) {
		return s(Ctrl, pt, hwnd, dataObj, grfKeyState, pdwEffect, bDrop, window.FV);
	}
	for (var i in eventTE.Exec) {
		var hr = eventTE.Exec[i](Ctrl, s, type, hwnd, pt, dataObj, grfKeyState, pdwEffect, bDrop, window.FV);
		if (isFinite(hr)) {
			return hr; 
		}
	}
	return window.Handled;
}

ExecScriptEx = function (Ctrl, s, type, hwnd, pt, dataObj, grfKeyState, pdwEffect, bDrop, FV)
{
	var fn = null;
	try {
		if (/J.*Script/i.test(type)) {
			fn = {Handled: new Function(s)};
		} else if (/VBScript/i.test(type)) {
			fn = api.GetScriptDispatch('Function Handled(Ctrl, pt, hwnd, dataObj, grfKeyState, pdwEffect, bDrop, FV)\n' + s + '\nEnd Function', type, true);
		}
		if (fn) {
			var r = fn.Handled(Ctrl, pt, hwnd, dataObj, grfKeyState, pdwEffect, bDrop, FV);
			return isFinite(r) ? r : window.Handled;
		}
	} catch (e) {
		ShowError(e, s);
		return window.Handled;
	}

	api.ExecScript(s, type,
		{
			window: window,
			Ctrl: Ctrl,
			pt: pt,
			hwnd: hwnd,
			dataObj: dataObj,
			grfKeyState: grfKeyState,
			pdwEffect: pdwEffect,
			bDrop: bDrop,
			FV: FV
		},
		function (ei, SourceLineText, dwSourceContext, lLineNumber, CharacterPosition)
		{
			MessageBox(api.SysAllocString(ei.bstrDescription) + api.sprintf(16, "\n%X\n", ei.scode) + api.SysAllocString(ei.bstrSource), TITLE, MB_OK);
		}
	);
	return window.Handled;
}

DropScript = function (Ctrl, s, type, hwnd, pt, dataObj, grfKeyState, pdwEffect, bDrop, FV)
{
	if (!pdwEffect) {
		pdwEffect = api.Memory("DWORD");
	}
	if (s.match("EnableDragDrop")) {
		return ExecScriptEx(Ctrl, s, type, hwnd, pt, dataObj, grfKeyState, pdwEffect, bDrop, FV);
	}
	pdwEffect[0] = DROPEFFECT_NONE;
	return E_NOTIMPL;
}

ExtractPath = function (Ctrl, s, pt)
{
	s = api.PathUnquoteSpaces(ExtractMacro(Ctrl, GetConsts(s)));
	if (/^\.|^\\$/.test(s)) {
		var FV = GetFolderView(Ctrl, pt);
		if (FV) {
			if (s == "\\") {
				return fso.GetDriveName(FV.FolderItem.Path) + s;
			}
			if (s == "..") {
				return api.GetDisplayNameOf(api.ILGetParent(FV), SHGDN_FORADDRESSBAR | SHGDN_FORPARSING);
			}
			if (/\.\.\\(.*)/.test(s)) {
				return fso.BuildPath(api.GetDisplayNameOf(api.ILGetParent(FV), SHGDN_FORADDRESSBAR | SHGDN_FORPARSING), RegExp.$1);
			}
			if (/\.\\(.*)/.test(s)) {
				return fso.BuildPath(api.GetDisplayNameOf(FV, SHGDN_FORADDRESSBAR | SHGDN_FORPARSING), RegExp.$1);
			}
		}
	}
	return s;
}

ExtractMacro = function (Ctrl, s)
{
	if (typeof(s) == "string") {
		for (var j = 10; j--;) {
			var s1 = s;
			for (var i in eventTE.ReplaceMacro) {
				var re = eventTE.ReplaceMacro[i][0];
				if (s.match(re)) {
					var r = eventTE.ReplaceMacro[i][1](Ctrl, re);
					if (typeof(r) == "string") {
						s = s.replace(re, r);
					}
				}
			}
			for (var i in eventTE.ExtractMacro) {
				var re = eventTE.ExtractMacro[i][0];
				if (s.match(re)) {
					s = eventTE.ExtractMacro[i][1](Ctrl, s, re);
				}
			}
			if (/%([^%]+)%/i.test(s)) {
				var re = RegExp.$1;
				var fn = eventTE.Environment[re.toLowerCase()];
				if (typeof(fn) == "string") {
					s = s.replace("%" + re + "%", fn);
				} else if (fn) {
					var r = fn(Ctrl);
					if (typeof(r) == "string") {
						s = s.replace("%" + re + "%", r);
					}
				}
			}
			s = wsh.ExpandEnvironmentStrings(s);
			if (s == s1) {
				break;
			}
		}
	}
	return s;
}

AddEnv("Selected", function(Ctrl)
{
	var ar = [];
	var FV = GetFolderView(Ctrl);
	if (FV) {
		var Selected = FV.SelectedItems();
		if (Selected) {
			for (var i = Selected.Count; i > 0; ar.unshift(api.PathQuoteSpaces(api.GetDisplayNameOf(Selected.Item(--i), SHGDN_FORPARSING)))) {
			}
		}
	}
	return ar.join(" ");
});

AddEnv("Current", function(Ctrl)
{
	var strSel = "";
	var FV = GetFolderView(Ctrl);
	if (FV) {
		strSel = api.PathQuoteSpaces(api.GetDisplayNameOf(FV, SHGDN_FORADDRESSBAR | SHGDN_FORPARSING));
	}
	return strSel;
});

AddEnv("TreeSelected", function(Ctrl)
{
	var strSel = "";
	if (!Ctrl || Ctrl.Type != CTRL_TV) {
		Ctrl = te.Ctrl(CTRL_TV);
	}
	if (Ctrl) {
		strSel = api.PathQuoteSpaces(api.GetDisplayNameOf(Ctrl.SelectedItem, SHGDN_FORADDRESSBAR | SHGDN_FORPARSING));
	}
	return strSel;
});

AddEnv("Installed", fso.GetDriveName(api.GetModuleFileName(null)));

PathMatchEx = function (path, s)
{
	if (/^\/(.*)\/(.*)/.test(s)) {
		return new RegExp(RegExp.$1, RegExp.$2).test(path);
	}
	return api.PathMatchSpec(path, s);
}

IsFolderEx = function (Item)
{
	var wfd = api.Memory("WIN32_FIND_DATA");
	api.SHGetDataFromIDList(Item, SHGDFIL_FINDDATA, wfd, wfd.Size);
	if (Item.IsFolder) {
		return (wfd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) || !Item.IsFileSystem;
	}
	return false;
}

OpenMenu = function (items, SelItem)
{
	var arMenu;
	var path = "";
	if (SelItem) {
		if (typeof(SelItem) != "object") {
			path = SelItem;	
		} else {
			if (SelItem.IsLink) {
				path = String(SelItem.ExtendedProperty("linktarget"));
			}
			if (!path) {
				path = String(api.GetDisplayNameOf(SelItem, SHGDN_FORADDRESSBAR | SHGDN_FORPARSING | SHGDN_FORPARSINGEX));
			}
			arMenu = OpenMenu(items, path);
			if (!IsFolderEx(SelItem) && (!SelItem.IsLink || !api.PathIsDirectory(path))) {
				return arMenu;
			}
			path += ".folder";
		}
	}
	arMenu = [];
	var arLevel = [];
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var strType = String(item.getAttribute("Type")).toLowerCase();
		var strFlag = strType == "menus" ? item.text.toLowerCase() : "";
		var bAdd = SelItem ? PathMatchEx(path, item.getAttribute("Filter")) : item.getAttribute("Filter") == "";
		if (strFlag == "close") {
			bAdd = arLevel.pop();
		}
		if (strFlag == "open") {
			arLevel.push(bAdd);
		}
		if (bAdd && (arLevel.length == 0 || arLevel[arLevel.length - 1])) {
			arMenu.push(i);
		}
	}
	return arMenu;
}

ExecMenu3 = function (Ctrl, Name, x, y)
{
	window.Ctrl = Ctrl;
	setTimeout(function () {
		ExecMenu2(Name, x, y);
	}, 99);;
}

ExecMenu2 = function (Name, x, y)
{
	if (!pt) {
		pt = api.Memory("POINT");
	}
	pt.x = x;
	pt.y = y;
	ExecMenu(Ctrl, Name, pt, 0);
}

AdjustMenuBreak = function (hMenu)
{
	var mii = api.Memory("MENUITEMINFO");
	mii.cbSize = mii.Size;
	var uFlags = 0;
	for (var i = api.GetMenuItemCount(hMenu); i-- > 0;) {
		mii.fMask = MIIM_FTYPE | MIIM_SUBMENU;
		api.GetMenuItemInfo(hMenu, i, true, mii);
		if (mii.hSubMenu) {
			AdjustMenuBreak(mii.hSubMenu);
			continue;
		}
		if (api.StrCmpI(api.GetMenuString(hMenu, i, MF_BYPOSITION), "")) {
			mii.fType |= uFlags;
			api.SetMenuItemInfo(hMenu, i, true, mii);
			uFlags = 0;
			continue;
		}
		var u = mii.fType & (MFT_MENUBREAK | MFT_MENUBARBREAK);
		if (u) {
			uFlags = u;
			api.DeleteMenu(hMenu, i++, MF_BYPOSITION);
		}
	}
}

teMenuGetElementsByTagName = function (Name)
{
	var menus = te.Data.xmlMenus.getElementsByTagName(Name);
	if (!menus || !menus.length) {
		if (api.StrCmpI(Name, "ViewContext") == 0) {
			menus = te.Data.xmlMenus.getElementsByTagName("Background");
		} else if (api.StrCmpI(Name, "Background") == 0) {
			menus = te.Data.xmlMenus.getElementsByTagName("ViewContext");
		}
	}
	return menus;
}

ExecMenu = function (Ctrl, Name, pt, Mode)
{
	var items = null;
	var menus = teMenuGetElementsByTagName(Name);
	if (!menus) {
		if (api.StrCmpI(Name, "ViewContext") == 0) {
			menus = teMenuGetElementsByTagName("Background");
		}
		if (api.StrCmpI(Name, "Background") == 0) {
			menus = teMenuGetElementsByTagName("ViewContext");
		}
	}
	if (menus && menus.length) {
		items = menus[0].getElementsByTagName("Item");
	}
	var uCMF = Ctrl.Type != CTRL_TV ? CMF_NORMAL | CMF_CANRENAME : CMF_EXPLORE | CMF_CANRENAME;
	if (api.GetKeyState(VK_SHIFT) < 0) {
		uCMF |= CMF_EXTENDEDVERBS;
	}
	var ar = GetSelectedArray(Ctrl, pt);
	var Selected = ar.shift();
	var SelItem = ar.shift();
	var FV = ar.shift();
	ExtraMenuCommand = [];
	ExtraMenuData = [];
	eventTE.MenuCommand = [];
	var arMenu;
	var item;
	if (items) {
		arMenu = OpenMenu(items, SelItem);
		if (arMenu.length) {
			item = items[arMenu[0]];
		}
		var nBase = api.QuadPart(menus[0].getAttribute("Base"));
		if (nBase == 1) {
			if (api.QuadPart(menus[0].getAttribute("Pos")) < 0) {
				item = items[arMenu[arMenu.length - 1]];
				if (arMenu.length > 1) {
					for (var i = arMenu.length; i--;) {
						var nLevel = 0;
						if (String(items[arMenu[i]].getAttribute("Type")).toLowerCase() == "menus") {
		 					var s = String(items[arMenu[i]].text).toLowerCase();
		 					if (s == "close") {
		 						nLevel++;
		 					}
		 					if (s == "open") {
		 						if (--nLevel < 0) {
		 							arMenu.splice(0, i + 1);
									nBase = 0;
									break;
								}
							}
						}
					}
				}
			}
		}
		if (nBase != 1) {
			var ar = GetBaseMenu(nBase, FV, Selected, uCMF, Mode, SelItem)
			var hMenu = ar.shift();
			var ContextMenu = ar.shift();
			if (nBase < 5) {
				var mii = api.Memory("MENUITEMINFO");
				mii.cbSize = mii.Size;
				mii.fMask = MIIM_FTYPE;
				for (var i = api.GetMenuItemCount(hMenu); i--;) {
					api.GetMenuItemInfo(hMenu, i, true, mii);
					if ((mii.fType & MFT_SEPARATOR) || api.GetMenuString(hMenu, i, MF_BYPOSITION).charAt(0) == '{') {
						api.DeleteMenu(hMenu, i, MF_BYPOSITION);
						continue;
					}
					break;
				}
			}
			g_nPos = MakeMenus(hMenu, menus, arMenu, items, Ctrl, pt);
			for (var i in eventTE[Name]) {
				g_nPos = eventTE[Name][i](Ctrl, hMenu, g_nPos, Selected, SelItem, ContextMenu);
			}
			if (!pt) {
				pt = api.Memory("POINT");
				pt.x = -1;
				pt.y = -1;
			}
			if (pt.x == -1 && pt.y == -1) {
				switch (Ctrl.Type) {
					case CTRL_SB:
					case CTRL_EB:
						Ctrl.GetItemPosition(SelItem, pt);
						api.ClientToScreen(Ctrl.hwnd, pt);
						break;
					default:
						api.ClientToScreen(te.hwnd, pt);
						break;
				}
			}
			AdjustMenuBreak(hMenu);
			window.g_menu_click = 2;
			var nVerb = api.TrackPopupMenuEx(hMenu, TPM_RIGHTBUTTON | TPM_RETURNCMD, pt.x, pt.y, te.hwnd, null, ContextMenu);
			if (ExtraMenuCommand[nVerb]) {
				ExtraMenuCommand[nVerb](Ctrl, pt, Name, nVerb);
				nVerb = 0;
			}
			if (nVerb) {
				for (var i in eventTE.MenuCommand) {
					var hr = eventTE.MenuCommand[i](Ctrl, pt, Name, nVerb, hMenu);
					if (isFinite(hr) && hr == S_OK) {
						nVerb = 0;
						break;
					}
				}
			}
			if (ContextMenu && nVerb >= ContextMenu.idCmdFirst && nVerb <= ContextMenu.idCmdLast) {
				if (ContextMenu.InvokeCommand(0, te.hwnd, nVerb - ContextMenu.idCmdFirst, null, null, SW_SHOWNORMAL, 0, 0) == S_OK) {
					nVerb = 0;
				}
			}
			api.DestroyMenu(hMenu);
			if (nVerb == 0) {
				return S_OK;
			}
			if (items) {
				item = items[nVerb - 1];
			}
			if (!item && FV && nVerb > 0x7000) {
				if (api.SendMessage(FV.hwndView, WM_COMMAND, nVerb, 0) == S_OK) {
					return S_OK;
				}
			}
		}
		if (item) {
			var s = item.getAttribute("Type");
			Exec(Ctrl, item.text, window.g_menu_button == 3 && s == "Open" ? "Open in New Tab" : s, Ctrl.hwnd, pt);
			return S_OK;
		}
		if (Mode != 2) {
			return S_OK;
		}
	}
	return S_FALSE;
}

GetBaseMenu = function (nBase, FV, Selected, uCMF, Mode, SelItem)
{
	for (var i in eventTE.GetBaseMenu) {
		var ar = eventTE.GetBaseMenu[i](nBase, FV, Selected, uCMF, Mode, SelItem);
		if (ar && ar[0]) {
			return ar; 
		}
	}
	var hMenu;
	var ContextMenu = null;
	switch (nBase) {
		case 2:
		case 4:
			var Items = Selected;
			if (!Items || !Items.Count) {
				Items = SelItem;
			}
			hMenu = api.CreatePopupMenu();
			if (nBase == 2 || Items && Items.Count) {
				ContextMenu = api.ContextMenu(Items, FV);
				if (ContextMenu) {
					ContextMenu.QueryContextMenu(hMenu, 0, 0x3001, 0x6fff, uCMF);
					if (SelItem) {
						SetRenameMenu(ContextMenu.idCmdFirst);
					}
				}
			} else if (FV) {
				ContextMenu = FV.ViewMenu();
				if (ContextMenu) {
					ContextMenu.QueryContextMenu(hMenu, 0, 0x3001, 0x6fff, uCMF);
					var mii = api.Memory("MENUITEMINFO");
					mii.cbSize = mii.Size;
					mii.fMask = MIIM_FTYPE | MIIM_SUBMENU;
					for (var i = api.GetMenuItemCount(hMenu); i--;) {
						api.GetMenuItemInfo(hMenu, 0, true, mii);
						if (mii.hSubMenu || (mii.fType & MFT_SEPARATOR)) {
							api.DeleteMenu(hMenu, 0, MF_BYPOSITION);
							continue;
						}
						break;
					}
				}
			}
			break;
		case 3:
			hMenu = api.CreatePopupMenu();
			if (FV) {
				ContextMenu = FV.ViewMenu();
				if (ContextMenu) {
					ContextMenu.QueryContextMenu(hMenu, 0, 0x3001, 0x6fff, uCMF | CMF_DONOTPICKDEFAULT);
				}
			}
			break;
		case 5:
		case 6:
			var id = nBase == 5 ? FCIDM_MENU_EDIT : FCIDM_MENU_VIEW;
			if (FV) {
				ContextMenu = FV.ViewMenu();
				if (ContextMenu) {
					hMenu = api.CreatePopupMenu();
					ContextMenu.QueryContextMenu(hMenu, 0, 0x3001, 0x6fff, CMF_DEFAULTONLY);
					var hMenu2 = te.MainMenu(id);
					var oMenu = {};
					var oMenu2 = {};
					var mii = api.Memory("MENUITEMINFO");
					mii.cbSize = mii.Size;
					mii.fMask = MIIM_SUBMENU;
					for (var i = api.GetMenuItemCount(hMenu2); i-- > 0;) {
						var s = api.GetMenuString(hMenu2, i, MF_BYPOSITION);
						if (s) {
							s = s.toLowerCase().replace(/[&\(\)]/g, "");
							api.GetMenuItemInfo(hMenu2, i, true, mii);
							oMenu2[s] = mii.hSubMenu;
						}
					}
					MenuDbInit(hMenu, oMenu, oMenu2);
					MenuDbReplace(hMenu, oMenu, hMenu2);
				}
			} else {
				hMenu = te.MainMenu(id);
			}
			break;
		case 7:
			hMenu = api.CreatePopupMenu();
			var dir = GetHelpMenu(true);
			for (var i = 0; i < dir.length; i++) {
				var s = dir[i];
				if (s === null) {
					api.InsertMenu(hMenu, MAXINT, MF_BYPOSITION | MF_SEPARATOR, 0, null);
				} else {
					if (s) {
						api.InsertMenu(hMenu, MAXINT, MF_BYPOSITION | MF_STRING, i + 0x3001, s);
					}
				}
			}
			AddEvent("MenuCommand", function (Ctrl, pt, Name, nVerb)
			{
				var s = GetHelpMenu(false)[nVerb - 0x3001];
				if (s) {
					if (api.StrCmpI(typeof s, "function")) {
						Navigate(s, SBSP_NEWBROWSER);
						return;
					}
					s(Ctrl, pt, Name, nVerb);
					return S_OK;
				}
			});
			break;
		case 8:
			hMenu = api.CreatePopupMenu();
			api.InsertMenu(hMenu, MAXINT, MF_BYPOSITION | MF_STRING, 0x3001, GetText("&Add to Favorites..."));
			ExtraMenuCommand[0x3001] = AddFavoriteEx;
			api.InsertMenu(hMenu, MAXINT, MF_BYPOSITION | MF_STRING, 0x3002, GetText("&Edit"));
			ExtraMenuCommand[0x3002] = function ()
			{
				ShowOptions("Tab=Menus&Menus=Favorites");
			};
			api.InsertMenu(hMenu, MAXINT, MF_BYPOSITION | MF_SEPARATOR, 0, null);
			break;
		default:
			hMenu = api.CreatePopupMenu();
			break;
	}
	return [hMenu, ContextMenu];
}

GetHelpMenu = function (bTitle)
{
	var dir = [fso.BuildPath(te.Data.DataFolder, "config") , null, ssfDRIVES, ssfNETHOOD, ssfWINDOWS, ssfSYSTEM, ssfPROGRAMFILES];
	if (api.sizeof("HANDLE") > 4) {
		dir.push(ssfPROGRAMFILESx86);
	} else if (api.IsWow64Process(api.GetCurrentProcess())) {
		dir.push(api.GetDisplayNameOf(ssfPROGRAMFILES, SHGDN_FORPARSING).replace(/\s*\(x86\)$/i, ""));
	}
	dir.push(fso.GetSpecialFolder(2).Path);
	if (WINVER >= 0x600) {
		dir.push("shell:libraries");
	}
	dir = dir.concat([ssfPERSONAL, ssfSTARTMENU, ssfPROGRAMS, ssfSTARTUP, ssfSENDTO, ssfAPPDATA, ssfFAVORITES, ssfRECENT, ssfHISTORY, ssfDESKTOPDIRECTORY, ssfCONTROLS, ssfTEMPLATES, ssfFONTS, ssfPRINTERS, ssfBITBUCKET]);
	if (bTitle) {
		for (var i = dir.length; i--;) {
			dir[i] = api.GetDisplayNameOf(dir[i], SHGDN_INFOLDER);
		}
		return [te.About, GetText("Check for updates"), GetText("Get Add-ons")].concat(dir);
	}
	return [api.GetModuleFileName(null) + "\\..", CheckUpdate, GetAddons].concat(dir);
}

MenuDbInit = function (hMenu, oMenu, oMenu2)
{
	for (var i = api.GetMenuItemCount(hMenu); i--;) {
		var mii = api.Memory("MENUITEMINFO");
		mii.cbSize = mii.Size;
		mii.fMask = MIIM_ID | MIIM_BITMAP | MIIM_SUBMENU | MIIM_DATA | MIIM_FTYPE | MIIM_STATE;
		var s = api.GetMenuString(hMenu, i, MF_BYPOSITION);
		api.GetMenuItemInfo(hMenu, i, true, mii);
		if (s) {
			s = s.toLowerCase().replace(/[&\(\)]/g, "");
			oMenu[s] = mii;
			api.RemoveMenu(hMenu, i, MF_BYPOSITION);
			if (oMenu2 && mii.hSubMenu && !oMenu2[s]) {
				MenuDbInit(mii.hSubMenu, oMenu, null)
			}
		} else {
			api.DeleteMenu(hMenu, i, MF_BYPOSITION);
		}
	}
}

MenuDbReplace = function (hMenu, oMenu, hMenu2)
{
	for (var i = api.GetMenuItemCount(hMenu2); i-- > 0;) {
		var s = api.GetMenuString(hMenu2, 0, MF_BYPOSITION);
		var mii = null;
		var s2 = null;
		if (s) {
			s2 = s.toLowerCase().replace(/[&\(\)]/g, "");
			mii = oMenu[s2];
			if (!mii) {
				s2 = s2.replace(/\t.*/, "");
				mii = oMenu[s2];
			}
		}
		if (mii) {
			delete oMenu[s2];
			api.DeleteMenu(hMenu2, 0, MF_BYPOSITION);
		} else {
			mii = api.Memory("MENUITEMINFO");
			mii.cbSize = mii.Size;
			mii.fMask = MIIM_ID | MIIM_BITMAP | MIIM_SUBMENU | MIIM_DATA | MIIM_FTYPE | MIIM_STATE;
			api.GetMenuItemInfo(hMenu2, 0, true, mii);
			if (mii.hSubMenu) {
				api.DeleteMenu(hMenu2, 0, MF_BYPOSITION);
				continue;
			} else {
				api.RemoveMenu(hMenu2, 0, MF_BYPOSITION);
			}
		}
		mii.fMask = MIIM_ID | MIIM_BITMAP | MIIM_SUBMENU | MIIM_DATA | MIIM_FTYPE | MIIM_STATE;
		if (s) {
			mii.dwTypeData = s;
			mii.fMask |= MIIM_STRING;
		}
		api.InsertMenuItem(hMenu, MAXINT, false, mii);
	}
	for (var s in oMenu) {
		if (!/^\t/.test(s)) {
			api.InsertMenuItem(hMenu2, MAXINT, false, oMenu[s]);
		}
	}
	api.DestroyMenu(hMenu2);
}

GetAccelerator = function (s)
{
	if (/&(.)/.test(s)) {
		return RegExp.$1;
	}
	return "";
}

AddMenuIconFolderItem = function (mii, FolderItem)
{
	var image = te.GdiplusBitmap();
	var info = api.Memory("SHFILEINFO");
	api.ShGetFileInfo(FolderItem, 0, info, info.Size, SHGFI_ICON | SHGFI_SMALLICON | SHGFI_SYSICONINDEX | SHGFI_PIDL);
	var id = info.iIcon;
	mii.hbmpItem = MainWindow.g_arBM['U' + id];
	if (mii.hbmpItem) {
		mii.fMask = mii.fMask | MIIM_BITMAP;
		return;
	}
	var hIcon = info.hIcon;
	image.FromHICON(hIcon, GetSysColor(COLOR_MENU));
	api.DestroyIcon(hIcon);
	AddMenuImage(mii, image, id);
}

AddMenuImage = function (mii, image, id)
{
	mii.hbmpItem = image.GetHBITMAP(WINVER >= 0x600 ? null : GetSysColor(COLOR_MENU));
	if (mii.hbmpItem) {
		mii.fMask = mii.fMask | MIIM_BITMAP;
		if (id) {
			MainWindow.g_arBM['U' + id] = mii.hbmpItem;
		} else {
			MainWindow.g_arBM.push(mii.hbmpItem);
		}
	}
}

MenusIcon = function (mii, src)
{
	mii.cbSize = mii.Size;
	if (src) {
		src = ExtractMacro(te, src);
		var image = te.GdiplusBitmap();
		if (REGEXP_IMAGE.test(src)) {
			image.FromFile(src);
		} else {
			var hIcon = MakeImgIcon(src, 0, 16);
			image.FromHICON(hIcon, GetSysColor(COLOR_MENU));
			api.DestroyIcon(hIcon);
		}
		AddMenuImage(mii, image);
	}
}

MakeMenus = function (hMenu, menus, arMenu, items, Ctrl, pt)
{
	var hMenus = [hMenu];
	var nPos = menus ? Number(menus[0].getAttribute("Pos")) : 0;
	var nLen = api.GetMenuItemCount(hMenu);
	var nResult = 0;
	if (nPos < 0) {
		nPos += nLen + 1;
	}
	if (nPos > nLen || nPos < 0) {
		nPos = nLen;
	}
	nLen = arMenu.length;
	for (var i = 0; i < nLen; i++) {
		var item = items[arMenu[i]];
		var s = (item.getAttribute("Name") || item.getAttribute("Mouse") || GetKeyName(item.getAttribute("Key")) || "").replace(/\\t/i, "\t");
		var strFlag = String(item.getAttribute("Type")).toLowerCase() == "menus" ? item.text.toLowerCase() : "";
		if (strFlag == "close") {
			hMenus.pop();
			if (!hMenus.length) {
				break;
			}
		} else {
			var ar = s.split(/\t/);
			ar[0] = GetText(ar[0]);
			if (ar.length > 1) {
				ar[1] = GetKeyName(ar[1]);
			}
			if (strFlag == "open") {
				var mii = api.Memory("MENUITEMINFO");
				mii.fMask = MIIM_STRING | MIIM_SUBMENU | MIIM_FTYPE;
				mii.fType = 0;
				mii.dwTypeData = ar.join("\t");
				mii.hSubMenu = api.CreatePopupMenu();
				MenusIcon(mii, item.getAttribute("Icon"));
				api.InsertMenuItem(hMenus[hMenus.length - 1], nPos++, true, mii);
				hMenus.push(mii.hSubMenu);
			} else {
				nResult = arMenu[i] + 1;
				if (s == "/" || api.StrCmpI(strFlag, "Break") == 0) {
					api.InsertMenu(hMenus[hMenus.length - 1], nPos++, MF_BYPOSITION | MF_MENUBREAK | MF_DISABLED, 0, "");
				} else if (s == "//" || api.StrCmpI(strFlag, "BarBreak") == 0) {
					api.InsertMenu(hMenus[hMenus.length - 1], nPos++, MF_BYPOSITION | MF_MENUBARBREAK | MF_DISABLED, 0, "");
				} else if (s == "-" || api.StrCmpI(strFlag, "Separator") == 0) {
					api.InsertMenu(hMenus[hMenus.length - 1], nPos++, MF_BYPOSITION | MF_SEPARATOR, 0, null);
				} else if (s) {
					var mii = api.Memory("MENUITEMINFO");
					mii.fMask = MIIM_STRING | MIIM_ID;
					mii.wId = nResult;
					mii.dwTypeData = ar.join("\t");
					MenusIcon(mii, item.getAttribute("Icon"));
					RunEvent3(["MenuState", item.getAttribute("Type"), item.text].join(":"), Ctrl, pt, mii);
					api.InsertMenuItem(hMenus[hMenus.length - 1], nPos++, true, mii);
				}
			}
		}
	}
	return nResult;
}

SaveXmlEx = function (filename, xml)
{
	try {
		filename = fso.BuildPath(te.Data.DataFolder, "config\\" + filename);
		xml.save(filename);
	} catch (e) {
		if (e.number != E_ACCESSDENIED) {
			ShowError(e, "Save: " + filename);
		}
	}
}

BlurId = function (Id)
{
	document.getElementById(Id).blur();
}

RunCommandLine = function (s)
{
	var arg = api.CommandLineToArgv(s.replace(/\/[^,\s]*/g, ""));
	for (var i = 1; i < arg.length; i++) {
		if (/,/.test(arg[i])) {
			var ar = arg[i].split(",");
			Exec(te, GetSourceText(ar[1]), GetSourceText(ar[0]), te.hwnd, api.Memory("POINT"))
			continue;
		}
		Navigate(arg[i], SBSP_NEWBROWSER);
	}
}

OpenNewProcess = function (fn, ex)
{
	var uid;
	do {
		uid = String(Math.random()).replace(/^0?\./, "");
	} while (Exchange[uid]);
	Exchange[uid] = ex;
	return wsh.Exec([api.PathQuoteSpaces(api.GetModuleFileName(null)), '/run', fn, uid].join(" "));
}

GetAddonInfo = function (Id)
{
	var info = [];

	var path = fso.GetParentFolderName(api.GetModuleFileName(null));
	var xml = te.CreateObject("Msxml2.DOMDocument");
	xml.async = false;
	var xmlfile = fso.BuildPath(path, "addons\\" + Id + "\\config.xml");
	if (fso.FileExists(xmlfile)) {
		xml.load(xmlfile);

		GetAddonInfo2(xml, info, "General", true);
		GetAddonInfo2(xml, info, "en", true);
		GetAddonInfo2(xml, info, GetLangId());
		if (!info.Name) {
			info.Name = Id;
		}
	}
	return info;
}

GetAddonInfo2 = function (xml, info, Tag, bTrans)
{
	var items = xml.getElementsByTagName(Tag);
	if (items.length) {
		var item = items[0].childNodes;
		for (var i = 0; i < item.length; i++) {
			var n = item[i].tagName;
			info[n] = bTrans && /Name|Description/i.test(n) ? GetText(item[i].text) : item[i].text;
		}
	}
}

OpenXml = function (strFile, bAppData, bEmpty, strInit)
{
	var xml = te.CreateObject("Msxml2.DOMDocument");
	xml.async = false;
	var path = fso.BuildPath(te.Data.DataFolder, "config\\" + strFile);
	if (fso.FileExists(path) && xml.load(path)) {
		return xml;
	}
	if (!bAppData) {
		path = fso.BuildPath(fso.GetParentFolderName(api.GetModuleFileName(null)), "config\\" + strFile);
		if (fso.FileExists(path) && xml.load(path)) {
			var Dest = sha.NameSpace(fso.BuildPath(te.Data.DataFolder, "config"));
			Dest.MoveHere(path, FOF_SILENT | FOF_NOCONFIRMATION);
			return xml;
		}
	}
	if (strInit) {
		path = fso.BuildPath(strInit, strFile);
		if (fso.FileExists(path) && xml.load(path)) {
			return xml;
		}
	}
	path = fso.BuildPath(fso.GetParentFolderName(api.GetModuleFileName(null)), "init\\" + strFile);
	if (fso.FileExists(path) && xml.load(path)) {
		return xml;
	}
	return bEmpty ? xml : null;
}

CreateXml = function ()
{
	var xml = te.CreateObject("Msxml2.DOMDocument");
	xml.async = false;
	xml.appendChild(xml.createProcessingInstruction("xml", 'version="1.0" encoding="UTF-8"'));
	return xml;
}

Extract = function (Src, Dest)
{
	for (var i in eventTE.Extract) {
		var hr = eventTE.Extract[i](Src, Dest);
		if (isFinite(hr)) {
			return hr; 
		}
	}
	try {
		var oSrc = sha.NameSpace(Src)
		if (oSrc) {
			var oDest = sha.NameSpace(Dest);
			if (oDest) {
				oDest.CopyHere(oSrc.Items(), FOF_NOCONFIRMATION);
				return S_OK;
			}
		}
	} catch (e) {
		if (api.Extract(fso.BuildPath(system32, "zipfldr.dll"), "{E88DCCE0-B7B3-11d1-A9F0-00AA0060FA31}", Src, Dest) != S_OK) {
			MessageBox(GetText("Extract Error"), TITLE, MB_OK);
		}
	}
	return S_OK;
}

OptionRef = function (Id, s, pt)
{
	for (var i in eventTE.OptionRef) {
		var r = eventTE.OptionRef[i](Id, s, pt);
		if (r !== undefined) {
			return r; 
		}
	}
}

OptionDecode = function (Id, p)
{
	for (var i in eventTE.OptionDecode) {
		var hr = eventTE.OptionDecode[i](Id, p);
		if (isFinite(hr)) {
			return hr; 
		}
	}
}

OptionEncode = function (Id, p)
{
	for (var i in eventTE.OptionEncode) {
		var hr = eventTE.OptionEncode[i](Id, p);
		if (isFinite(hr)) {
			return hr;
		}
	}
}

function GetAddons()
{
	ShowOptions("Tab=Get Addons");
}

function CheckUpdate()
{
	var url = "https://www.eonet.ne.jp/~gakana/tablacus/";
	var xhr = createHttpRequest();
	xhr.open("GET", url + "explorer_en.html?" + Math.floor(new Date().getTime() / 60000), false);
	xhr.setRequestHeader('Pragma', 'no-cache');
	xhr.setRequestHeader('Cache-Control', 'no-cache');
	xhr.setRequestHeader('If-Modified-Since', 'Thu, 01 Jun 1970 00:00:00 GMT');
	xhr.send(null);
	if (!/<td id="te">(.*?)<\/td>/i.test(xhr.responseText)) {
		return;
	}
	var s = RegExp.$1;
	if (!/<a href="dl\/([^"]*)/i.test(s)) {
		return;
	}
	var file = RegExp.$1;
	s = s.replace(/Download/i, "").replace(/<[^>]*>/ig, "");
	var ver = 0;
	if (/(\d+)/.test(file)) {
		ver = 20000000 + api.QuadPart(RegExp.$1)
	}
	if (ver <= te.Version) {
		MessageBox(te.About + "\n" + GetText("the latest version"), TITLE, MB_ICONINFORMATION);
		return;
	}
	if (!confirmOk(GetText("Update available") + "\n" + s + "\n" + GetText("Do you want to install it now?"))) {
		return;
	}
	var temp = fso.BuildPath(fso.GetSpecialFolder(2).Path, "tablacus");
	if (!IsExists(temp)) {
		CreateFolder(temp);
	}
	wsh.CurrentDirectory = temp;
	var InstalledFolder = fso.GetParentFolderName(api.GetModuleFileName(null));
	var zipfile = fso.BuildPath(temp, file);
	temp += "\\explorer";
	DeleteItem(temp);
	CreateFolder(temp);

	DownloadFile(url + "dl/" + file, zipfile);
	if (Extract(zipfile, temp) != S_OK) {
		return;
	}
	var te64exe = temp + "\\te64.exe";
	var nDog = 300;
	while (!fso.FileExists(te64exe)) {
		if (wsh.Popup(GetText("Please wait."), 1, TITLE, MB_ICONINFORMATION | MB_OKCANCEL) == IDCANCEL || nDog-- == 0) {
			return;
		}
	}
	var arDel = [];
	var addons = temp + "\\addons";

	for (var list = new Enumerator(fso.GetFolder(addons).SubFolders); !list.atEnd(); list.moveNext()) {
		var n = list.item().Name;
		var items = te.Data.Addons.getElementsByTagName(n);
		if (!items || items.length == 0) {
			arDel.push(fso.BuildPath(addons, n));
		}
	}
	if (arDel.length) {
		api.SHFileOperation(FO_DELETE, arDel.join("\0"), null, FOF_SILENT | FOF_NOCONFIRMATION, false);
	}
	var Taskkill = "";
	if (fso.FileExists(fso.BuildPath(system32, "taskkill.exe"))) {
		var pid = api.Memory("DWORD");
		api.GetWindowThreadProcessId(te.hwnd, pid);
		Taskkill = "W.Run('taskkill /pid " + pid[0] + " /f',2,true);";
	}
	var update = api.sprintf(2000, "\
F='%s';\
Q='\\x22';\
A=new ActiveXObject('Shell.Application');\
W=new ActiveXObject('WScript.Shell');\
W.Popup('%s',9,'Tablacus Explorer',%d);\
%s\
A.NameSpace(F).MoveHere(A.NameSpace('%s').Items(),%d);\
W.Run(Q+F+'\\\\%s'+Q);\
close()", EscapeUpdateFile(InstalledFolder), GetText("Please wait."), MB_ICONINFORMATION, Taskkill, EscapeUpdateFile(temp), FOF_NOCONFIRMATION | FOF_NOCONFIRMMKDIR,
EscapeUpdateFile(fso.GetFileName(api.GetModuleFileName(null)))).replace(/[\t\n]/g, "");
	wsh.CurrentDirectory = temp;
	var exe = "mshta.exe";
	var s1 = '"javascript:';
	if (update.length >= 500 || !fso.FileExists(fso.BuildPath(system32, exe))) {
		exe = "wscript.exe";
		s1 = fso.GetParentFolderName(temp) + "\\update.js";
		DeleteItem(s1);
		var a = fso.CreateTextFile(s1, true);
		a.WriteLine(update.replace(/close\(\)$/, ""));
		a.Close();
		update = s1;
		s1 = '"';
	}
	var mshta = wsh.ExpandEnvironmentStrings("%windir%\\Sysnative\\") + exe;
	if (!fso.FileExists(mshta)) {
		mshta = fso.BuildPath(system32, exe);
 	}
	var oExec = wsh.Exec([api.PathQuoteSpaces(mshta), ' ', s1, update, '"'].join(""));
	wsh.AppActivate(oExec.ProcessID);
	api.PostMessage(te.hwnd, WM_CLOSE, 0, 0);
}

function EscapeUpdateFile(s)
{
	return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

confirmYN = function (s, title)
{
	return MessageBox(s, title, MB_ICONQUESTION | MB_YESNO) == IDYES;
}

confirmOk = function (s, title)
{
	return MessageBox(s, title, MB_ICONQUESTION | MB_OKCANCEL) == IDOK;
}

MessageBox = function (s, title, uType)
{
	return api.MessageBox(api.GetForegroundWindow(), GetText(s), GetText(title) || TITLE, uType);
}

createHttpRequest = function ()
{
	try {
		return te.CreateObject("Msxml2.XMLHTTP");
	} catch (e) {
		return te.CreateObject("Microsoft.XMLHTTP");
	}
}

InputDialog = function (text, defaultText)
{
	return prompt(GetText(text), defaultText);
}

AddonOptions = function (Id, fn, Data)
{
	var sParent = fso.GetParentFolderName(api.GetModuleFileName(null));
	LoadLang2(fso.BuildPath(sParent, "addons\\" + Id + "\\lang\\" + GetLangId() + ".xml"));
	var items = te.Data.Addons.getElementsByTagName(Id);
	if (!items.length) {
		var root = te.Data.Addons.documentElement;
		if (root) {
			root.appendChild(te.Data.Addons.createElement(Id));
		}
	}
	var info = GetAddonInfo(Id);
	var sURL = "../addons/" + Id + "/options.html";
	if (!Data) {
		Data = {};
	}
	Data.id = Id;
	var sFeatures = info.Options;
	if (/Common:([\d,]+):(\d)/i.test(sFeatures)) {
		sURL = "location.html";
		Data.show = RegExp.$1;
		Data.index = RegExp.$2;
		sFeatures = 'Default';
	}
	if (api.StrCmpI(sFeatures, "Location") == 0) {
		sURL = "location.html";
		Data.show = "6";
		Data.index = "6";
		sFeatures = 'Default';
	}
	if (api.StrCmpI(sFeatures, "Default") == 0) {
		sFeatures = 'Width: 640; Height: 480';
	}
	try {
		var dlg = MainWindow.g_dlgs[Id];
		if (dlg) {
			dlg.Focus();
			return;
		}
	} catch (e) {
		delete MainWindow.g_dlgs[Id];
	}
	var opt = {MainWindow: MainWindow, Data: Data, event: {}};
	if (fn) {
		opt.event.TEOk = fn;
	} else if (window.g_Chg) {
		opt.event.TEOk = function ()
		{
			g_Chg.Addons = true;
		}
	}
	if (/width: *([0-9]+)/i.test(sFeatures)) {
		opt.width = RegExp.$1 - 0;
		if (/height: *([0-9]+)/i.test(sFeatures)) {
			opt.height = RegExp.$1 - 0;
		}
	}
	opt.event.onbeforeunload = function () {
		delete MainWindow.g_dlgs[Id];
	}
	MainWindow.g_dlgs[Id] = ShowDialog(sURL, opt);
}

function CalcVersion(s)
{
	var r = 0;
	if (/(\d+)\.(\d+)\.(\d+)/.test(s)) {
		r = api.QuadPart(RegExp.$1) * 10000 + api.QuadPart(RegExp.$2) * 100 + api.QuadPart(RegExp.$3);
	}
	if (r < 2000 * 10000) {
		r += 2000 * 10000;
	}
	return r;
}

GethwndFromPid = function (ProcessId, bDT)
{
	var hProcess = api.OpenProcess(PROCESS_QUERY_INFORMATION, false, ProcessId);
	if (hProcess) {
		api.WaitForInputIdle(hProcess, 10000);
		api.CloseHandle(hProcess);
	}
	var nIndex = bDT ? GWL_EXSTYLE : GWLP_HWNDPARENT;
	var nFilter = bDT ? 16 : -1;
	var nValue = bDT ? 16 : 0;
	var hwnd = api.GetTopWindow(null);
	do {
		if ((api.GetWindowLongPtr(hwnd, nIndex) & nFilter) == nValue && api.IsWindowVisible(hwnd)) {
			var pProcessId = api.Memory("DWORD");
			api.GetWindowThreadProcessId(hwnd, pProcessId);
			if (ProcessId == pProcessId[0]) {
				return hwnd;
			}
		}
	} while (hwnd = api.GetWindow(hwnd, GW_HWNDNEXT));
	return null;
}

PopupContextMenu = function (Item, FV)
{
	var hMenu = api.CreatePopupMenu();
	var ContextMenu = api.ContextMenu(Item, FV);
	if (ContextMenu) {
		var uCMF = (api.GetKeyState(VK_SHIFT) < 0) ? CMF_EXTENDEDVERBS : CMF_NORMAL;
		ContextMenu.QueryContextMenu(hMenu, 0, 1, 0x7FFF, uCMF);
		var pt = api.Memory("POINT");
		api.GetCursorPos(pt);
		var nVerb = api.TrackPopupMenuEx(hMenu, TPM_RIGHTBUTTON | TPM_RETURNCMD, pt.x, pt.y, te.hwnd, null, ContextMenu);
		g_popup = null;
		if (nVerb) {
			ContextMenu.InvokeCommand(0, te.hwnd, nVerb - 1, null, null, SW_SHOWNORMAL, 0, 0);
		}
	}
	api.DestroyMenu(hMenu);
}

GetAddonOption = function (strAddon, strTag)
{
	var items = te.Data.Addons.getElementsByTagName(strAddon);
	if (items.length) {
		var item = items[0];
		return item.getAttribute(strTag);
	}
}

GetAddonOptionEx = function (strAddon, strTag)
{
	return api.QuadPart(GetAddonOption (strAddon, strTag));
}

GetInnerFV = function (id)
{
	var TC = te.Ctrl(CTRL_TC, id);
	if (TC && TC.SelectedIndex >= 0) {
		return TC.Selected;
	}
	return null;
}

OpenInExplorer = function (FV)
{
	if (FV) {
		CancelWindowRegistered();
		var exp = te.CreateObject("new:{C08AFD90-F2A1-11D1-8455-00A0C91F3880}");
		var pid = FV.FolderItem || FV;
		if (api.ILIsEqual(pid.Alt, ssfRESULTSFOLDER)) {
			pid = pid.Path;
		}
		exp.Navigate2(pid, 2);
		exp.Visible = true;
		api.SetForegroundWindow(exp.HWND);
		if (FV.FolderItem) {
			try {
				exp.Document.CurrentViewMode = FV.CurrentViewMode;
			} catch (e) {}
			try {
				do {
					api.Sleep(100);
				} while (exp.Busy || exp.ReadyState < 4);
				var doc = exp.Document;
				doc.CurrentViewMode = FV.CurrentViewMode;
				if (doc.IconSize) {
					doc.IconSize = FV.IconSize;
					doc.SortColumns = FV.SortColumns;
					doc.GroupBy = FV.GroupBy.replace(/^-/, "");
				}
			} catch (e) {}
			try {
				if (FV.TreeView.Visible) {
					exp.ShowBrowserBar("{EFA24E64-B078-11D0-89E4-00C04FC9E26E}", true);
				}
			} catch (e) {}
		}
	}
}

CancelWindowRegistered = function ()
{
	clearTimeout(g_tidWindowRegistered);
	g_bWindowRegistered = false;
	g_tidWindowRegistered = setTimeout(function ()
	{
		g_bWindowRegistered = true;
	}, 9999);
}

ShowDialogEx = function (mode, w, h, ele)
{
	ShowDialog(fso.BuildPath(fso.GetParentFolderName(api.GetModuleFileName(null)), "script\\dialog.html"), { MainWindow: MainWindow, Query: mode, width: w, height: h, element: ele});
}
ShowNew = function (Ctrl, pt, Mode)
{
	var FV = GetFolderView(Ctrl, pt);
	var path = api.GetDisplayNameOf(FV, SHGDN_FORPARSING);
	if (/^[A-Z]:\\|^\\/i.test(path)) {
		ShowDialog(fso.BuildPath(fso.GetParentFolderName(api.GetModuleFileName(null)), "script\\dialog.html"), { MainWindow: MainWindow, Query: "new", Mode: Mode, path: path, FV: FV, Modal: false, width: 480, height: 120});
	}
}

CreateNewFolder = function (Ctrl, pt)
{
	ShowNew(Ctrl, pt, "folder");
	return S_OK;
}

CreateNewFile = function (Ctrl, pt)
{
	ShowNew(Ctrl, pt, "file");
	return S_OK;
}

InputMouse = function (o)
{
	ShowDialogEx("mouse", 500, 420, o || document.F.MouseMouse || document.F.Mouse);
}

InputKey = function(o)
{
	ShowDialogEx("key", 320, 120, o || document.F.KeyKey || document.F.Key);
}

ShowIconEx = function (ele)
{
	if (!ele) {
		ele = document.F.Icon;
		ShowDialogEx("icon", 640, 480, ele);
	}
}

ShowLocationEx = function (s)
{
	ShowDialog(fso.BuildPath(fso.GetParentFolderName(api.GetModuleFileName(null)), "script\\location.html"), {MainWindow: MainWindow, Data: s});
}

function MakeKeySelect()
{
	var oa = document.getElementById("_KeyState");
	if (oa) {
		var ar = [];
		for (var i = 0; i < 4; i++) {
			var s = MainWindow.g_KeyState[i][0];
			ar.push('<input type="checkbox" onclick="KeyShift(this)" id="_Key', s, '"><label for="_Key', s, '">', s, '&nbsp;</label>');
		}
		oa.insertAdjacentHTML("AfterBegin", ar.join(""));
	}
	oa = document.getElementById("_KeySelect");
	oa.length = 0;
	oa[++oa.length - 1].value = "";
	oa[oa.length - 1].text = GetText("Select");
	var s = [];
	for (var j = 256; j >= 0; j -= 256) {
		for (var i = 128; i > 0; i--) {
			var v = api.GetKeyNameText((i + j) * 0x10000);
			if (v && v.charCodeAt(0) > 32) {
				s.push(v);
			}
		}
	}
	s.sort(function (a,b) {
		if (a.length != b.length && (a.length == 1 || b.length == 1)) {
			return a.length - b.length;
		}
		return api.StrCmpLogical(a, b);
	});
	var j = "";
	for (i in s) {
		if (j != s[i]) {
			j = s[i];
			var o = oa[++oa.length - 1];
			o.value = j;
			o.text = j + " ";
		}
	}
}

function SetKeyShift()
{
	var key = (document.F.elements.KeyKey || document.F.elements.Key).value;
	for (var i = 0; i < MainWindow.g_KeyState.length; i++) {
		var s = MainWindow.g_KeyState[i][0];
		var o = document.getElementById("_Key" + s);
		if (o) {
			o.checked = key.match(s + "+");
		}
		key = key.replace(s + "+", "");
	}
	o = document.getElementById("_KeySelect");
	for (var i = o.length; i--;) {
		if (api.StrCmpI(key, o[i].value) == 0) {
			o.selectedIndex = i;
			break;
		}
	}
}

function KeyShift(o)
{
	var oKey = document.F.elements.KeyKey || document.F.elements.Key;
	var key = oKey.value;
	var shift = o.id.replace(/^_Key(.*)/, "$1+");
	key = key.replace(shift, "");
	if (o.checked) {
		key = shift + key;
	}
	oKey.value = key;
}

function KeySelect(o)
{
	var oKey = document.F.elements.KeyKey || document.F.elements.Key;
	oKey.value = oKey.value.replace(/(\+)[^\+]*$|^[^\+]*$/, "$1") + o[o.selectedIndex].value;
}

GetLangId = function ()
{
	return te.Data.Conf_Lang || navigator.userLanguage.replace(/\-.*/,"");
}

GetSourceText = function (s)
{
	try {
		return (MainWindow.LangSrc || LangSrc)[s] || s;
	} catch (e) {
		return s;
	}
}

GetFolderView = function (Ctrl, pt, bStrict)
{
	if (!Ctrl) {
		return te.Ctrl(CTRL_FV);
	}
	if (!Ctrl.Type) {
		var o = Ctrl.offsetParent;
		while (o) {
			if (/^Panel_(\d+)$/.test(o.id)) {
				return te.Ctrl(CTRL_TC, RegExp.$1).Selected;
			}
			o = o.offsetParent
		}
		return te.Ctrl(CTRL_FV);
	}
	if (Ctrl.Type <= CTRL_EB) {
		return Ctrl;
	}
	if (Ctrl.Type == CTRL_TV) {
		return Ctrl.FolderView;
	}
	if (Ctrl.Type != CTRL_TC) {
		return te.Ctrl(CTRL_FV);
	}
	if (pt) {
		var i = Ctrl.HitTest(pt);
		if (i >= 0) {
			return Ctrl.Item(i);
		}
	}
	if (!bStrict || !pt) {
		return Ctrl.Selected;
	}
}

GetSelectedArray = function (Ctrl, pt, bPlus)
{
	var Selected, SelItem;
	var FV = null;
	var bSel = true;
	switch(Ctrl.Type) {
		case CTRL_SB:
		case CTRL_EB:
			FV = Ctrl;
			break;
		case CTRL_TC:
			FV = Ctrl.Item(Ctrl.HitTest(pt));
			bSel = false;
			break;
		case CTRL_TV:
			FV = Ctrl.FolderView;
			SelItem = Ctrl.SelectedItem;
			break;
		case CTRL_WB:
			FV = te.Ctrl(CTRL_FV);
			SelItem = window.Input;
			break;
		default:
			FV = te.Ctrl(CTRL_FV);
			break;
	}
	if (FV && !SelItem) {
		if (bSel) {
	 		Selected = FV.SelectedItems();
		}
		if (Selected && Selected.Count) {
			SelItem = Selected.Item(0);
		} else {
			SelItem = FV.FolderItem;
		}
	}
	if (!Selected || Selected.Count == 0) {
		Selected = te.FolderItems();
		if (bPlus) {
			Selected.AddItem(SelItem);
		}
	}
	return [Selected, SelItem, FV];
}

StripAmp = function (s)
{
	return s.replace(/\(&\w\)|&/, "").replace(/\.\.\.$/, "");
}

GetGestureKey = function ()
{
	var s = "";
	if (api.GetKeyState(VK_SHIFT) < 0) {
		s += "S";
	}
	if (api.GetKeyState(VK_CONTROL) < 0) {
		s += "C";
	}
	if (api.GetKeyState(VK_MENU) < 0) {
		s += "A";
	}
	return s;
}

GetGestureButton = function ()
{
	var s = "";
	if (api.GetKeyState(VK_LBUTTON) < 0) {
		s = "1";
	}
	if (api.GetKeyState(VK_RBUTTON) < 0) {
		s += "2";
	}
	if (api.GetKeyState(VK_MBUTTON) < 0) {
		s += "3";
	}
	if (api.GetKeyState(VK_XBUTTON1) < 0) {
		s += "4";
	}
	if (api.GetKeyState(VK_XBUTTON2) < 0) {
		s += "5";
	}
	return s;
}

GetWebColor = function (c)
{
	return isNaN(c) && /^#[0-9a-f]{3,6}$/i ? c : api.sprintf(8, "#%06x", ((c & 0xff) << 16) | (c & 0xff00) | ((c & 0xff0000) >> 16));
}

GetWinColor = function (c)
{
	if (/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.test(c)) {
		return Number(["0x", RegExp.$3, RegExp.$2, RegExp.$1].join(""));
	}
	if (/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.test(c)) {
		return Number(["0x", RegExp.$3, RegExp.$3, RegExp.$2, RegExp.$2, RegExp.$1, RegExp.$1].join(""));
	}
	return c;
}

ChooseColor = function (c)
{
	var cc = api.Memory("CHOOSECOLOR");
	cc.lStructSize = cc.Size;
	cc.hwndOwner = api.GetForegroundWindow();
	cc.Flags = CC_FULLOPEN | CC_RGBINIT;
	cc.rgbResult = c;
	cc.lpCustColors = te.Data.CustColors;
	if (api.ChooseColor(cc)) {
		return cc.rgbResult;
	}
}

ChooseWebColor = function (c)
{
	c = ChooseColor(GetWinColor(c));
	if (isFinite(c)) {
		return GetWebColor(c);
	}
}

SetCursor = function (o, s)
{
	if (o) {
		if (o.style) {
			o.style.cursor = s;
		}
		if (o.getElementsByTagName) {
			var e = o.getElementsByTagName("*");
			for (var i in e) {
				if (e[i].style) {
					e[i].style.cursor = s;
				}
			}
		}
	}
}

function MouseOver(o)
{
	if (api.PathMatchSpec(o.className, 'button;menu')) {
		if (objHover && o != objHover) {
			MouseOut();
		}
		var pt = api.Memory("POINT");
		api.GetCursorPos(pt, true);
		if (HitTest(o, pt)) {
			objHover = o;
			o.className = 'hover' + o.className;
		}
	}
}

function MouseOut(s)
{
	if (objHover) {
		if (!s || objHover.id.match(s)) {
			if (objHover.className == 'hoverbutton') {
				objHover.className = 'button';
			} else if (objHover.className == 'hovermenu') {
				objHover.className = 'menu';
			}
			objHover = null;
		}
	}
}

InsertTab = function(e)
{
	var ot = (e || event).srcElement;
	if (event.keyCode == VK_TAB) {
		ot.focus();
		if (document.all && document.selection) {
			var selection = document.selection.createRange();
			if (selection) {
				selection.text += "\t";
				return false;
			}
		}
		var i = ot.selectionEnd || s.length;
		var s = ot.value;
		ot.value = s.substr(0, i) + "\t" + s.substr(i, s.length);
		ot.selectionStart = ++i;
		ot.selectionEnd = i;
		return false;
	}
	return true;
}

RegEnumKey = function(hKey, Name)
{
	try {
		var locator = te.CreateObject("WbemScripting.SWbemLocator");
		var server = locator.ConnectServer(null, "root\\default");
		var reg = server.Get("StdRegProv");
		var Params = [hKey, Name, null];
		api.ExecMethod(reg, "EnumKey", Params);
		return new VBArray(Params[2]).toArray();
	} catch (e) {}
	return [];
}

FindText = function (s)
{
	if (s) {
		var bFound = true;
		var rng = document.body.createTextRange();

		while (bFound) {
			for (var i = 0; i <= g_nFind && (bFound = rng.findText(s)); i++) {
				rng.moveStart("character", 1);
				rng.moveEnd("textedit");
			}
			if (bFound) {
				rng.moveStart("character", -1);
				rng.findText(s);
				document.body.onselectstart = null;
				try {
					rng.select();
					bFound = false;
				} catch (e) {}
				document.body.onselectstart = DetectProcessTag;
				rng.scrollIntoView();
				g_nFind++;
			} else {
				g_nFind = 0;
			}
		}
		return;
	}
	api.OleCmdExec(document, null, 32, 0, 0);
}

FindKeyEvent = function (o)
{
	if (event.keyCode == VK_RETURN) {
		FindText(o.value);
		return false;
	}
	g_nFind = 0;
}

OpenDialogEx = function (path, filter)
{
	var commdlg = te.CommonDialog;
	var te_path = fso.GetParentFolderName(api.GetModuleFileName(null));
	if (/^\.\.(\/.*)/.test(path)) {
		path = te_path + (RegExp.$1.replace(/\//g, "\\"));
	}
	if (!fso.FolderExists(path)) {
		path = fso.GetDriveName(te_path);
	}
	commdlg.InitDir = path;
	commdlg.Filter = filter;
	commdlg.Flags = OFN_FILEMUSTEXIST | OFN_EXPLORER | OFN_ENABLESIZING | OFN_ENABLEHOOK;
	if (commdlg.ShowOpen()) {
		return api.PathQuoteSpaces(commdlg.FileName);
	}
}

OpenDialog = function (path)
{
	return OpenDialogEx(path, "All Files|*.*");
}

ChooseFolder = function (path, pt)
{
	if (!pt) {
		pt = api.Memory("POINT");
		api.GetCursorPos(pt);
	}
	var FolderItem = api.ILCreateFromPath(path);
	FolderItem = FolderMenu.Open(FolderItem.IsFolder ? FolderItem : ssfDRIVES, pt.x, pt.y);
	if (FolderItem) {
		return api.GetDisplayNameOf(FolderItem, SHGDN_FORADDRESSBAR | SHGDN_FORPARSING | SHGDN_FORPARSINGEX);
	}
}

BrowseForFolder = function (path)
{
	return OpenDialogEx(path, GetText("Folder") + "|<Folder>");
}

InvokeCommand = function (Items, fMask, hwnd, Verb, Parameters, Directory, nShow, dwHotKey, hIcon, FV, uCMF)
{
	if (Items) {
		var ContextMenu = api.ContextMenu(Items, FV);
		if (ContextMenu) {
			var hMenu = api.CreatePopupMenu();
			ContextMenu.QueryContextMenu(hMenu, 0, 1, 0x7FFF, uCMF);
			if (Verb === null) {
				Verb = api.GetMenuDefaultItem(hMenu, MF_BYCOMMAND, GMDI_USEDISABLED) - 1;
			}
			if (!Directory && FV) {
				Directory = api.GetDisplayNameOf(FV.FolderItem, SHGDN_FORPARSING);
				if (!/^[A-Z]:\\|^\\/i.test(Directory)) {
					Directory = null;
				}
			}
			ContextMenu.InvokeCommand(fMask, hwnd, Verb, Parameters, Directory, nShow, dwHotKey, hIcon);
			api.DestroyMenu(hMenu);
		}
	}
}

SetRenameMenu = function (n)
{
	ExtraMenuCommand[CommandID_RENAME + n - 1] = function (Ctrl, pt, Name, nVerb)
	{
		setTimeout(function ()
		{
			wsh.SendKeys("{F2}");
		}, 99);
	};
}

ShowError = function (e, s, i)
{
	if (isFinite(i)) {
		if (eventTA[s][i]) {
			s = eventTA[s][i] + " : " + s;
		}
	}
	MessageBox([(e.description || e.toString()), s].join("\n"), TITLE, MB_OK);
}

ApiStruct = function (oTypedef, nAli, oMemory)
{
	this.Size = 0;
	this.Typedef = oTypedef;
	for (var i in oTypedef) {
		var ar = oTypedef[i];
		var n = ar[1];
		this.Size += (n - (this.Size % n)) % n;
		ar[3] = this.Size;
		this.Size += n * (ar[2] || 1);
	}
	n = api.LowPart(nAli);
	this.Size += (n - (this.Size % n)) % n;
	this.Memory = api.StrCmpI(typeof oMemory, "object") ? api.Memory("BYTE", this.Size) : oMemory;
	this.Read = function (Id)
	{
		var ar = this.Typedef[Id];
		if (ar) {
			return this.Memory.Read(ar[3], ar[0]);
		}
	};
	this.Write = function (Id, Data)
	{
		var ar = this.Typedef[Id];
		if (ar) {
			this.Memory.Write(ar[3], ar[0], Data);
		}
	};
}

FindChildByClass = function (hwnd, s)
{
	var hwnd1, hwnd2;
	while (hwnd1 = api.FindWindowEx(hwnd, hwnd1, null, null)) {
		if (api.GetClassName(hwnd1) == s) {
			return hwnd1;
		}
		if (hwnd2 = FindChildByClass(hwnd1, s)) {
			return hwnd2;
		}
	}
	return null;
}

DownloadFile = function (url, fn)
{
	var xhr = createHttpRequest();
	xhr.open("GET", url, false);
	xhr.send(null);

	var ado = te.CreateObject("Adodb.Stream");
	ado.Type = adTypeBinary;
	ado.Open();
	ado["Write"](xhr["r_e_s_p_o_n_s_e_B_o_d_y".replace(/_/g, "")]);
	ado.SaveToFile(fn, adSaveCreateOverWrite);
	ado.Close();
}

GetNavigateFlags = function (FV)
{
	if (!FV && OpenMode != SBSP_NEWBROWSER) {
		FV = te.Ctrl(CTRL_FV);
	}
	return api.GetKeyState(VK_CONTROL) < 0 || (FV && FV.Data.Lock) ? SBSP_NEWBROWSER : OpenMode;
}

AddEvent("ConfigChanged", function (s)
{
	te.Data["bSave" + s] = true;
});

GetSysColor = function (i)
{
	var c = g_Colors[i];
	return c !== undefined ? c : api.GetSysColor(i);
}

SetSysColor = function (i, color)
{
	g_Colors[i] = color;
}

ShellExecute = function (s, vOperation, nShow, vDir2, pt)
{
	var arg = api.CommandLineToArgv(s);
	var s = arg.shift();
	var vDir = fso.GetParentFolderName(s) || vDir2;
	if (pt && vDir.Type) {
		vDir = (GetFolderView(Ctrl, pt) || {FolderItem: {}}).FolderItem.Path;
	}
	for (var i = arg.length; i-- > 0;) {
		arg[i] = api.PathQuoteSpaces(arg[i]);
	}
	return sha.ShellExecute(s, arg.join(" "), vDir, vOperation, nShow);
}

CreateFont = function (LogFont)
{
	var key = [LogFont.lfFaceName, LogFont.lfHeight, LogFont.lfCharSet, LogFont.lfWeight, LogFont.lfItalic, LogFont.lfUnderline].join("\t");
	var hFont = te.Data.Fonts[key];
	if (!hFont) {
		hFont = api.CreateFontIndirect(LogFont);
		te.Data.Fonts[key] = hFont;
	}
	return hFont;
}

Activate = function (o, id)
{
	var TC = te.Ctrl(CTRL_TC);
	if (TC && TC.Id != id) {
		var FV = GetInnerFV(id);
		if (FV) {
			FV.Focus();
			if (o) {
				o.focus();
			}
		}
	}
}

function DetectProcessTag(e)
{
	return /input|textarea/i.test((e || event).srcElement.tagName);
}

AddEventEx(window, "load", function ()
{
	document.body.onselectstart = DetectProcessTag;
	document.body.oncontextmenu = DetectProcessTag;
});

Alt = function ()
{
	return S_OK;
}

GetSavePath = function (FolderItem)
{
	var path = api.GetDisplayNameOf(FolderItem, SHGDN_FORPARSING | SHGDN_FORPARSINGEX);
	if (!/^[A-Z]:\\|^\\/i.test(path)) {
		if (/search\-ms:.*?&crumb=location:([^&]*)/.test(api.GetDisplayNameOf(FolderItem, SHGDN_FORADDRESSBAR | SHGDN_FORPARSING))) {
			return api.PathCreateFromUrl("file:" + RegExp.$1);
		}
	}
	if (/\?/.test(path)) {
		var nCount = api.ILGetCount(FolderItem);
		path = [];
		while (nCount-- > 0) {
			path.unshift(api.GetDisplayNameOf(FolderItem, (nCount > 0 ? SHGDN_FORADDRESSBAR : 0) | SHGDN_FORPARSING | SHGDN_INFOLDER));
			FolderItem = api.ILRemoveLastID(FolderItem);
		}
		return path.join("\\")
	}
	return path;
}

LoadAddon = function(ext, Id, arError)
{
	try {
		var ado = te.CreateObject("Adodb.Stream");
		ado.CharSet = "utf-8";
		ado.Open();
		var fname = fso.BuildPath(fso.GetParentFolderName(api.GetModuleFileName(null)), "addons") + "\\" + Id + "\\script." + ext;
		ado.LoadFromFile(fname);
		var s = ado.ReadText();
		ado.Close();
		if (!api.StrCmpI(ext, "js")) {
			(new Function(s))(Id);
		} else if (!api.StrCmpI(ext, "vbs")) {
			var fn = api.GetScriptDispatch(s, "VBScript", {"_Addon_Id": {"Addon_Id": Id}, window: window},
				function (ei, SourceLineText, dwSourceContext, lLineNumber, CharacterPosition)
				{
					arError.push(api.SysAllocString(ei.bstrDescription) + api.sprintf(16, "\nLine: %d\n", lLineNumber) + fname);
				}
			);
			if (fn) {
				Addons["_stack"].push(fn);
			}
		}
	} catch (e) {
		arError.push([(e.description || e.toString()), fname].join("\n"));
	}
}

AddEventEx(window, "beforeunload", function ()
{
	var hwnd = api.GetWindow(document);
	var hwnd1 = hwnd;
	while (hwnd1 = api.GetParent(hwnd)) {
		hwnd = hwnd1;
	}
	while (hwnd1 = api.FindWindowEx(null, hwnd1, null, null)) {
		if (hwnd == api.GetWindowLongPtr(hwnd1, GWLP_HWNDPARENT)) {
			api.PostMessage(hwnd1, WM_CLOSE, 0, 0);
		}
	}
});
