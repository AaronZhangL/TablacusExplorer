#pragma once

#include "resource.h"
#include <Mshtml.h>
#include <mshtmhst.h>
#include "mshtmdid.h"
#include <commdlg.h>
#include <gdiplus.h>
#include <commctrl.h>
#include <Shlobj.h>
#include <Shellapi.h>
#include <shobjidl.h>
#include <Shlwapi.h>
#include <exdispid.h> //DISPID_*
#include <Commdlg.h>
#include <Dbt.h>
#include <propkey.h>
#include <process.h>
#include <Wincrypt.h>
#include <ActivScp.h>
#include <windowsx.h>
#include <CommonControls.h>

using namespace Gdiplus;

#import <shdocvw.dll> exclude("OLECMDID", "OLECMDF", "OLECMDEXECOPT", "tagREADYSTATE") auto_rename
//#import <mshtml.tlb>
#pragma comment(lib, "comctl32.lib") 
#pragma comment(lib, "shlwapi.lib") 
#pragma comment(lib, "gdiplus.lib") 
#pragma comment(lib, "urlmon.lib") 

#ifdef _WIN64
#pragma comment(linker,"/manifestdependency:\"type='win32' name='Microsoft.Windows.Common-Controls' version='6.0.0.0' processorArchitecture='amd64' publicKeyToken='6595b64144ccf1df' language='*'\"")
#else
#pragma comment(linker,"/manifestdependency:\"type='win32' name='Microsoft.Windows.Common-Controls' version='6.0.0.0' processorArchitecture='x86' publicKeyToken='6595b64144ccf1df' language='*'\"")
#define _2000XP
#define _W2000
#endif
#define _VISTA7
//#define _USE_TESTOBJECT

//Unnamed function
typedef VOID (WINAPI * LPFNSHRunDialog)(HWND hwnd, HICON hIcon, LPWSTR pszPath, LPWSTR pszTitle, LPWSTR pszPrompt, DWORD dwFlags);

//XP or higher.
typedef BOOL (WINAPI * LPFNCryptBinaryToStringW)(__in_bcount(cbBinary) CONST BYTE *pbBinary, __in DWORD cbBinary, __in DWORD dwFlags, __out_ecount_part_opt(*pcchString, *pcchString) LPWSTR pszString, __inout DWORD *pcchString);
typedef HRESULT (WINAPI * LPFNSHParseDisplayName)(LPCWSTR pszName, IBindCtx *pbc, PIDLIST_ABSOLUTE *ppidl, SFGAOF sfgaoIn, SFGAOF *psfgaoOut);
typedef HRESULT (WINAPI * LPFNSHGetImageList)(__in int iImageList, __in REFIID riid, __deref_out void **ppvObj);

//XP SP1 or higher.
typedef BOOL (WINAPI * LPFNSetDllDirectoryW)(__in_opt LPCWSTR lpPathName);

//XP SP2 or higher with Windos Desktop Search.
typedef HRESULT (STDAPICALLTYPE * LPFNPSPropertyKeyFromString)(__in LPCWSTR pszString,  __out PROPERTYKEY *pkey);
typedef HRESULT (STDAPICALLTYPE * LPFNPSGetPropertyKeyFromName)(__in PCWSTR pszName, __out PROPERTYKEY *ppropkey);
typedef HRESULT (STDAPICALLTYPE * LPFNPSGetPropertyDescription)(__in REFPROPERTYKEY propkey, __in REFIID riid,  __deref_out void **ppv);

//Vista or higher.
typedef HRESULT (STDAPICALLTYPE * LPFNSHCreateItemFromIDList)(__in PCIDLIST_ABSOLUTE pidl, __in REFIID riid, __deref_out void **ppv);
typedef HRESULT (STDAPICALLTYPE * LPFNSHGetIDListFromObject)(__in IUnknown *punk, __deref_out PIDLIST_ABSOLUTE *ppidl);

//typedef HRESULT (STDAPICALLTYPE * LPFNPSFormatForDisplayAlloc)(__in REFPROPERTYKEY key, __in REFPROPVARIANT propvar, __in PROPDESC_FORMAT_FLAGS pdff, __deref_out PWSTR *ppszDisplay);
//typedef BOOL (WINAPI * LPFNChangeWindowMessageFilter)(UINT message, DWORD dwFlag);

//DLL
typedef HRESULT (STDAPICALLTYPE * LPFNDllGetClassObject)(REFCLSID rclsid, REFIID riid, LPVOID* ppv);
typedef HRESULT (STDAPICALLTYPE * LPFNDllCanUnloadNow)(void);

//Tablacus DLL Add-ons
typedef VOID (WINAPI * LPFNGetProcObjectW)(VARIANT *pVarResult);


#define WINDOW_CLASS			L"TablacusExplorer"
#define MAX_LOADSTRING			100
#define MAX_HISTORY				32
#define MAX_CSIDL				256
#define MAX_FORMATS				1024
#define MAX_TC					128
#define MAX_FV					1024
#define MAX_PATHEX				32768
#define MAX_PROP				4096
#define SIZE_BUFF				32768
#define TET_Create				1
#define TET_Reload				2
#define TET_Size				3
#define TET_Size2				4
#define TET_Redraw				5
#define TET_Show				6
#define TET_Unload				7

#define SHGDN_FORPARSINGEX	0x80000000
#define START_OnFunc			5000
#define TE_OnKeyMessage			0
#define TE_OnMouseMessage		1
#define TE_OnViewCreated		2
#define TE_OnDefaultCommand		3
#define TE_OnCreate				4
#define TE_OnDragEnter			5
#define TE_OnDragOver			6
#define TE_OnDrop				7
#define TE_OnDragLeave			8
#define TE_OnBeforeNavigate		9
#define TE_OnItemClick			10
#define TE_OnGetPaneState		11
#define TE_OnMenuMessage		12
#define TE_OnSystemMessage		13
#define TE_OnShowContextMenu	14
#define TE_OnSelectionChanged	15
#define TE_OnClose				16
#define TE_OnVisibleChanged		17
#define TE_OnAppMessage			18
#define TE_OnStatusText			19
#define TE_OnToolTip			20
#define TE_OnNewWindow			21
#define	TE_OnWindowRegistered	22
#define TE_OnSelectionChanging	23
#define TE_OnClipboardText		24
#define TE_OnCommand			25
#define TE_OnInvokeCommand		26
#define TE_OnArrange			27
#define TE_OnHitTest			28
#define Count_OnFunc			29

#define SB_OnIncludeObject		0

#define Count_SBFunc			1

#define CTRL_FV          0
#define CTRL_SB          1
#define CTRL_EB          2
#define CTRL_TE    0x10000
#define CTRL_WB    0x20000
#define CTRL_TC    0x30000
#define CTRL_TV    0x40000
#define CTRL_DT    0x80000

#define TE_VT 24
#define TE_VI 0xffffff
#define TE_METHOD		0x40000000
#define TE_OFFSET		0x30000000
#define DISPID_TE_ITEM  0x3fffffff
#define DISPID_TE_COUNT 0x3ffffffe
#define DISPID_TE_INDEX 0x3ffffffd
#define DISPID_TE_MAX TE_VI

#define DISPID_AMBIENT_OFFLINEIFNOTCONNECTED -5501

#define TE_Type		0
#define TE_Left		1
#define TE_Top		2
#define TE_Width	3
#define TE_Right	3
#define TE_Height	4
#define TE_Bottom	4
#define TE_Flags	5
#define TE_Tab		5
#define TE_Align	6
#define TE_CmdShow	6
#define TC_TabWidth		7
#define TC_TabHeight	8

#define SB_Type			0
#define SB_ViewMode		1
#define SB_FolderFlags	2
#define	SB_Options		3
#define	SB_ViewFlags	4
#define SB_IconSize		5

#define SB_TreeAlign	6
#define SB_TreeWidth	7
#define SB_TreeFlags	8
#define SB_EnumFlags	9
#define SB_RootStyle	10
#define SB_Root			11

#define	SB_DoFunc	12
#define	SB_Count	13

#define	TVVERBS 16

#define MAP_TE	0
#define MAP_SB	1
#define MAP_TC	2
#define MAP_TV	3
#define MAP_WB	4
#define MAP_API	5
#define MAP_Mem	6
#define MAP_GB	7
#define MAP_FIs	8
#define MAP_FI	9
#define MAP_DT	10
#define MAP_CM	11
#define MAP_CD	12
#define MAP_SS	13
#define MAP_M2	14
#define MAP_LENGTH	15

typedef struct tagMethod
{
	LONG   id;
	LPWSTR name;
} method, *lpmethod;

typedef struct tagTEColumn
{
	SHCOLSTATEF	csFlags;
	int		nWidth;
} TEColumn;

typedef struct tagTEInvoke
{
	IDispatch *pdisp;
	DISPID dispid;
	int	cArgs;
	VARIANT *pv;
	PVOID	pResult;
} TEInvoke, *lpTEInvoke;

const CLSID CLSID_ShellShellNameSpace = {0x2F2F1F96, 0x2BC1, 0x4b1c, { 0xBE, 0x28, 0xEA, 0x37, 0x74, 0xF4, 0x67, 0x6A}};
const CLSID CLSID_JScriptChakra       = {0x16d51579, 0xa30b, 0x4c8b, { 0xa2, 0x76, 0x0f, 0xf4, 0xdc, 0x41, 0xe7, 0x55}}; 

class CteShellBrowser;
class CteTreeView;

class CteDll : public IUnknown
{
public:
	STDMETHODIMP QueryInterface(REFIID riid, void **ppvObject);
	STDMETHODIMP_(ULONG) AddRef();
	STDMETHODIMP_(ULONG) Release();

	CteDll(HMODULE hDll);
	~CteDll();
public:
	LONG		m_cRef;
	HMODULE		m_hDll;
};

class CteFolderItem : public FolderItem, public IPersistFolder2
{
public:
	STDMETHODIMP QueryInterface(REFIID riid, void **ppvObject);
	STDMETHODIMP_(ULONG) AddRef();
	STDMETHODIMP_(ULONG) Release();
	//IPersist
    STDMETHODIMP GetClassID(CLSID *pClassID);
	//IPersistFolder
    STDMETHODIMP Initialize(PCIDLIST_ABSOLUTE pidl);
	//IPersistFolder2
    STDMETHODIMP GetCurFolder(PIDLIST_ABSOLUTE *ppidl);
	//IDispatch
	STDMETHODIMP GetTypeInfoCount(UINT *pctinfo);
	STDMETHODIMP GetTypeInfo(UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo);
	STDMETHODIMP GetIDsOfNames(REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId);
	STDMETHODIMP Invoke(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr);
	//FolderItem
    STDMETHODIMP get_Application(IDispatch **ppid);  
    STDMETHODIMP get_Parent(IDispatch **ppid);
    STDMETHODIMP get_Name(BSTR *pbs);
    STDMETHODIMP put_Name(BSTR bs);
    STDMETHODIMP get_Path(BSTR *pbs);
    STDMETHODIMP get_GetLink(IDispatch **ppid);
    STDMETHODIMP get_GetFolder(IDispatch **ppid);
    STDMETHODIMP get_IsLink(VARIANT_BOOL *pb);
    STDMETHODIMP get_IsFolder(VARIANT_BOOL *pb);
    STDMETHODIMP get_IsFileSystem(VARIANT_BOOL *pb);
    STDMETHODIMP get_IsBrowsable(VARIANT_BOOL *pb);
    STDMETHODIMP get_ModifyDate(DATE *pdt);
    STDMETHODIMP put_ModifyDate(DATE dt);
    STDMETHODIMP get_Size(LONG *pul);
    STDMETHODIMP get_Type(BSTR *pbs);
    STDMETHODIMP Verbs(FolderItemVerbs **ppfic);
    STDMETHODIMP InvokeVerb(VARIANT vVerb);
/*	//FolderItem2
    STDMETHODIMP InvokeVerbEx(VARIANT vVerb, VARIANT vArgs);
	STDMETHODIMP ExtendedProperty(BSTR bstrPropName, VARIANT *pvRet);
*/
	CteFolderItem(VARIANT *pv);
	~CteFolderItem();
	LPITEMIDLIST GetPidl();
	BOOL GetFolderItem();

	VARIANT			m_v;
	LPITEMIDLIST	m_pidl;
	FolderItem		*m_pFolderItem;
	BOOL			m_bStrict;
private:
	LONG			m_cRef;
};

class CteFolderItems : public FolderItems, public IDispatchEx, public IDataObject
{
public:
	STDMETHODIMP QueryInterface(REFIID riid, void **ppvObject);
	STDMETHODIMP_(ULONG) AddRef();
	STDMETHODIMP_(ULONG) Release();
	//IDispatch
	STDMETHODIMP GetTypeInfoCount(UINT *pctinfo);
	STDMETHODIMP GetTypeInfo(UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo);
	STDMETHODIMP GetIDsOfNames(REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId);
	STDMETHODIMP Invoke(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr);
	//IDispatchEx
	STDMETHODIMP GetDispID(BSTR bstrName, DWORD grfdex, DISPID *pid);
	STDMETHODIMP InvokeEx(DISPID id, LCID lcid, WORD wFlags, DISPPARAMS *pdp, VARIANT *pvarRes, EXCEPINFO *pei, IServiceProvider *pspCaller);
	STDMETHODIMP DeleteMemberByName(BSTR bstrName, DWORD grfdex);
	STDMETHODIMP DeleteMemberByDispID(DISPID id);
	STDMETHODIMP GetMemberProperties(DISPID id, DWORD grfdexFetch, DWORD *pgrfdex);
	STDMETHODIMP GetMemberName(DISPID id, BSTR *pbstrName);
	STDMETHODIMP GetNextDispID(DWORD grfdex, DISPID id, DISPID *pid);
	STDMETHODIMP GetNameSpaceParent(IUnknown **ppunk);
	//FolderItems
	STDMETHODIMP get_Count(long *plCount);
    STDMETHODIMP get_Application(IDispatch **ppid);    
    STDMETHODIMP get_Parent(IDispatch **ppid);    
    STDMETHODIMP Item(VARIANT index, FolderItem **ppid);
    STDMETHODIMP _NewEnum(IUnknown **ppunk);
	//IDataObject
	STDMETHODIMP GetData(FORMATETC *pformatetcIn, STGMEDIUM *pmedium);
	STDMETHODIMP GetDataHere(FORMATETC *pformatetc, STGMEDIUM *pmedium);
	STDMETHODIMP QueryGetData(FORMATETC *pformatetc);
	STDMETHODIMP GetCanonicalFormatEtc(FORMATETC *pformatectIn, FORMATETC *pformatetcOut);
	STDMETHODIMP SetData(FORMATETC *pformatetc, STGMEDIUM *pmedium, BOOL fRelease);
	STDMETHODIMP EnumFormatEtc(DWORD dwDirection, IEnumFORMATETC **ppenumFormatEtc);
	STDMETHODIMP DAdvise(FORMATETC *pformatetc, DWORD advf, IAdviseSink *pAdvSink, DWORD *pdwConnection);
	STDMETHODIMP DUnadvise(DWORD dwConnection);
	STDMETHODIMP EnumDAdvise(IEnumSTATDATA **ppenumAdvise);

	CteFolderItems(IDataObject *pDataObj, FolderItems *pFolderItems, BOOL bEditable);
	~CteFolderItems();

	HDROP GethDrop(int x, int y, BOOL fNC, BOOL bSpecial);
	VOID ItemEx(int nIndex, VARIANT *pVarResult, VARIANT *pVarNew);
	VOID AdjustIDListEx();
	VOID Clear();
	HRESULT QueryGetData2(FORMATETC *pformatetc);
public:
	int				m_nIndex;
	DWORD			m_dwEffect;

private:
	LPITEMIDLIST	*m_pidllist;
	LONG			m_cRef;
	IDataObject		*m_pDataObj;
	long			m_nCount;
	FolderItems		*m_pFolderItems;
	IDispatch		*m_oFolderItems;
	DWORD			m_dwTick;
	BOOL			m_bUseILF;
};

class CTE : public IDispatch, public IDropTarget, public IDropSource
{
public:
	STDMETHODIMP QueryInterface(REFIID riid, void **ppvObject);
	STDMETHODIMP_(ULONG) AddRef();
	STDMETHODIMP_(ULONG) Release();
	//IDispatch
	STDMETHODIMP GetTypeInfoCount(UINT *pctinfo);
	STDMETHODIMP GetTypeInfo(UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo);
	STDMETHODIMP GetIDsOfNames(REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId);
	STDMETHODIMP Invoke(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr);
	//IDropTarget
	STDMETHODIMP DragEnter(IDataObject *pDataObj, DWORD grfKeyState, POINTL pt, DWORD *pdwEffect);
	STDMETHODIMP DragOver(DWORD grfKeyState, POINTL pt, DWORD *pdwEffect);
	STDMETHODIMP DragLeave();
	STDMETHODIMP Drop(IDataObject *pDataObj, DWORD grfKeyState, POINTL pt, DWORD *pdwEffect);
	//IDropSource
	STDMETHODIMP QueryContinueDrag(BOOL fEscapePressed, DWORD grfKeyState);
	STDMETHODIMP GiveFeedback(DWORD dwEffect);

	CTE();
	~CTE();
public:
	int		m_param[7];
	BOOL	m_bDrop;
private:
	LONG	m_cRef;
	VARIANT m_Data;
	CteFolderItems *m_pDragItems;
	DWORD m_grfKeyState;
	HRESULT m_DragLeave;
};

class CteWebBrowser : public IDispatch, public IOleClientSite, public IOleInPlaceSite, public IDocHostUIHandler, public IDropTarget
{
public:
	STDMETHODIMP QueryInterface(REFIID riid, void **ppvObject);
	STDMETHODIMP_(ULONG) AddRef();
	STDMETHODIMP_(ULONG) Release();
	//IDispatch
	STDMETHODIMP GetTypeInfoCount(UINT *pctinfo);
	STDMETHODIMP GetTypeInfo(UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo);
	STDMETHODIMP GetIDsOfNames(REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId);
	STDMETHODIMP Invoke(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr);
	//IOleClientSite
	STDMETHODIMP SaveObject();
	STDMETHODIMP GetMoniker(DWORD dwAssign, DWORD dwWhichMoniker, IMoniker **ppmk);
	STDMETHODIMP GetContainer(IOleContainer **ppContainer);
	STDMETHODIMP ShowObject();
	STDMETHODIMP OnShowWindow(BOOL fShow);
	STDMETHODIMP RequestNewObjectLayout();
	//IOleWindow
	STDMETHODIMP GetWindow(HWND *phwnd);
	STDMETHODIMP ContextSensitiveHelp(BOOL fEnterMode);
	//IOleInPlaceSite
	STDMETHODIMP CanInPlaceActivate();
	STDMETHODIMP OnInPlaceActivate();
	STDMETHODIMP OnUIActivate();
	STDMETHODIMP GetWindowContext(IOleInPlaceFrame **ppFrame, IOleInPlaceUIWindow **ppDoc, LPRECT lprcPosRect, LPRECT lprcClipRect, LPOLEINPLACEFRAMEINFO lpFrameInfo);
	STDMETHODIMP Scroll(SIZE scrollExtant);
	STDMETHODIMP OnUIDeactivate(BOOL fUndoable);
	STDMETHODIMP OnInPlaceDeactivate();
	STDMETHODIMP DiscardUndoState();
	STDMETHODIMP DeactivateAndUndo();
	STDMETHODIMP OnPosRectChange(LPCRECT lprcPosRect);
	//IDocHostUIHandler
	STDMETHODIMP ShowContextMenu(DWORD dwID, POINT *ppt, IUnknown *pcmdtReserved, IDispatch *pdispReserved);
	STDMETHODIMP GetHostInfo(DOCHOSTUIINFO *pInfo);
	STDMETHODIMP ShowUI(DWORD dwID, IOleInPlaceActiveObject *pActiveObject, IOleCommandTarget *pCommandTarget, IOleInPlaceFrame *pFrame, IOleInPlaceUIWindow *pDoc);
	STDMETHODIMP HideUI(VOID);
	STDMETHODIMP UpdateUI(VOID);
	STDMETHODIMP EnableModeless(BOOL fEnable);
	STDMETHODIMP OnDocWindowActivate(BOOL fActivate);
	STDMETHODIMP OnFrameWindowActivate(BOOL fActivate);
	STDMETHODIMP ResizeBorder(LPCRECT prcBorder, IOleInPlaceUIWindow *pUIWindow, BOOL fFrameWindow);
	STDMETHODIMP TranslateAccelerator(LPMSG lpMsg, const GUID *pguidCmdGroup, DWORD nCmdID);
	STDMETHODIMP GetOptionKeyPath(LPOLESTR *pchKey, DWORD dw);
	STDMETHODIMP GetDropTarget(IDropTarget *pDropTarget, IDropTarget **ppDropTarget);
	STDMETHODIMP GetExternal(IDispatch **ppDispatch);
	STDMETHODIMP TranslateUrl(DWORD dwTranslate, OLECHAR *pchURLIn, OLECHAR **ppchURLOut);
	STDMETHODIMP FilterDataObject(IDataObject *pDO, IDataObject **ppDORet);
	//IDropTarget
	STDMETHODIMP DragEnter(IDataObject *pDataObj, DWORD grfKeyState, POINTL pt, DWORD *pdwEffect);
	STDMETHODIMP DragOver(DWORD grfKeyState, POINTL pt, DWORD *pdwEffect);
	STDMETHODIMP DragLeave();
	STDMETHODIMP Drop(IDataObject *pDataObj, DWORD grfKeyState, POINTL pt, DWORD *pdwEffect);

	CteWebBrowser(HWND hwnd, WCHAR *szPath);
	~CteWebBrowser();
	void Close();
	HWND get_HWND();
//	BOOL IsBusy();
public:
	IWebBrowser2 *m_pWebBrowser;
	HWND	m_hwnd;
	BSTR	m_bstrPath;
	HRESULT m_DragLeave;
	BOOL	m_bRedraw;
private:
	LONG	m_cRef;
	VARIANT m_Data;
	DWORD	m_dwCookie;
	CteFolderItems *m_pDragItems;
	DWORD	m_grfKeyState;
};

class CteTabs : public IDispatchEx, public IDropTarget
{
public:
	STDMETHODIMP QueryInterface(REFIID riid, void **ppvObject);
	STDMETHODIMP_(ULONG) AddRef();
	STDMETHODIMP_(ULONG) Release();
	//IDispatch
	STDMETHODIMP GetTypeInfoCount(UINT *pctinfo);
	STDMETHODIMP GetTypeInfo(UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo);
	STDMETHODIMP GetIDsOfNames(REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId);
	STDMETHODIMP Invoke(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr);
	//IDispatchEx
	STDMETHODIMP GetDispID(BSTR bstrName, DWORD grfdex, DISPID *pid);
	STDMETHODIMP InvokeEx(DISPID id, LCID lcid, WORD wFlags, DISPPARAMS *pdp, VARIANT *pvarRes, EXCEPINFO *pei, IServiceProvider *pspCaller);
	STDMETHODIMP DeleteMemberByName(BSTR bstrName, DWORD grfdex);
	STDMETHODIMP DeleteMemberByDispID(DISPID id);
	STDMETHODIMP GetMemberProperties(DISPID id, DWORD grfdexFetch, DWORD *pgrfdex);
	STDMETHODIMP GetMemberName(DISPID id, BSTR *pbstrName);
	STDMETHODIMP GetNextDispID(DWORD grfdex, DISPID id, DISPID *pid);
	STDMETHODIMP GetNameSpaceParent(IUnknown **ppunk);
	//IDropTarget
	STDMETHODIMP DragEnter(IDataObject *pDataObj, DWORD grfKeyState, POINTL pt, DWORD *pdwEffect);
	STDMETHODIMP DragOver(DWORD grfKeyState, POINTL pt, DWORD *pdwEffect);
	STDMETHODIMP DragLeave();
	STDMETHODIMP Drop(IDataObject *pDataObj, DWORD grfKeyState, POINTL pt, DWORD *pdwEffect);

	VOID TabChanged(BOOL bSameTC);
	CteShellBrowser * GetShellBrowser(int nPage);

	CteTabs();
	~CteTabs();

	VOID CreateTC();
	BOOL Create();
	VOID Init();
	VOID Close(BOOL bForce);
	VOID Move(int nSrc, int nDest, CteTabs *pDestTab);
	VOID LockUpdate();
	VOID UnLockUpdate();
	VOID RedrawUpdate();
	VOID Show(BOOL bVisible);
	VOID GetItem(int i, VARIANT *pVarResult);
	DWORD GetStyle();
	VOID SetItemSize();
public:
	int		m_nIndex;
	HWND	m_hwnd;
	HWND	m_hwndStatic;
	HWND	m_hwndButton;
	BOOL	m_bEmpty;
	DWORD	m_dwSize;
	int		m_param[9];
	SCROLLINFO m_si;
	int		m_nTC;
	BOOL	m_bVisible;
	int		m_nScrollWidth;
private:
	LONG	m_cRef;
	VARIANT m_Data;
	CteFolderItems *m_pDragItems;
	DWORD	m_grfKeyState;
	LONG	m_nLockUpdate;
	BOOL	m_bRedraw;
	HRESULT m_DragLeave;
};

class CteServiceProvider : public IServiceProvider
{
public:
	STDMETHODIMP QueryInterface(REFIID riid, void **ppvObject);
	STDMETHODIMP_(ULONG) AddRef();
	STDMETHODIMP_(ULONG) Release();
	//IServiceProvider
	STDMETHODIMP QueryService(REFGUID guidService, REFIID riid, void **ppv);

	CteServiceProvider(IShellBrowser *pSB, IShellView *pSV);
	~CteServiceProvider();

public:
	LONG	m_cRef;
	IShellBrowser *m_pSB;
	IShellView *m_pSV;
};

class CteShellBrowser : public IShellBrowser, public ICommDlgBrowser2, 
	public IShellFolderViewDual,
//	public IFolderFilter,
#ifdef _VISTA7
	public IExplorerBrowserEvents, public IExplorerPaneVisibility,
#endif
#ifdef _2000XP
	public IShellFolder2, public IShellFolderViewCB,
#endif
	public IDropTarget, public IPersistFolder2
{
public:
	STDMETHODIMP QueryInterface(REFIID riid, void **ppvObject);
	STDMETHODIMP_(ULONG) AddRef();
	STDMETHODIMP_(ULONG) Release();
	//IShellBrowser
	STDMETHODIMP GetWindow(HWND *phwnd);
	STDMETHODIMP ContextSensitiveHelp(BOOL fEnterMode);
	STDMETHODIMP InsertMenusSB(HMENU hmenuShared, LPOLEMENUGROUPWIDTHS lpMenuWidths);
	STDMETHODIMP SetMenuSB(HMENU hmenuShared, HOLEMENU holemenuRes, HWND hwndActiveObject);
	STDMETHODIMP RemoveMenusSB(HMENU hmenuShared);
	STDMETHODIMP SetStatusTextSB(LPCWSTR lpszStatusText);
	STDMETHODIMP EnableModelessSB(BOOL fEnable);
	STDMETHODIMP TranslateAcceleratorSB(LPMSG lpmsg, WORD wID);
	STDMETHODIMP BrowseObject(PCUIDLIST_RELATIVE pidl, UINT wFlags);
	STDMETHODIMP GetViewStateStream(DWORD grfMode, IStream **ppStrm);
	STDMETHODIMP GetControlWindow(UINT id, HWND *lphwnd);
	STDMETHODIMP SendControlMsg(UINT id, UINT uMsg, WPARAM wParam, LPARAM lParam, LRESULT *pret);
	STDMETHODIMP QueryActiveShellView(IShellView **ppshv);
	STDMETHODIMP OnViewWindowActive(IShellView *ppshv);
	STDMETHODIMP SetToolbarItems(LPTBBUTTONSB lpButtons, UINT nButtons, UINT uFlags);
	//ICommDlgBrowser
	STDMETHODIMP OnDefaultCommand(IShellView *ppshv);
	STDMETHODIMP OnStateChange(IShellView *ppshv, ULONG uChange);
	STDMETHODIMP IncludeObject(IShellView *ppshv, LPCITEMIDLIST pidl);
	//ICommDlgBrowser2
    STDMETHODIMP Notify(IShellView *ppshv, DWORD dwNotifyType);
    STDMETHODIMP GetDefaultMenuText(IShellView *ppshv, LPWSTR pszText, int cchMax);
    STDMETHODIMP GetViewFlags(DWORD *pdwFlags);
	/*IFolderFilter
	STDMETHODIMP ShouldShow(IShellFolder *psf, PCIDLIST_ABSOLUTE pidlFolder, PCUITEMID_CHILD pidlItem);
	STDMETHODIMP GetEnumFlags(IShellFolder *psf, PCIDLIST_ABSOLUTE pidlFolder, HWND *phwnd, DWORD *pgrfFlags);*/
	//IDispatch
	STDMETHODIMP GetTypeInfoCount(UINT *pctinfo);
	STDMETHODIMP GetTypeInfo(UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo);
	STDMETHODIMP GetIDsOfNames(REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId);
	STDMETHODIMP Invoke(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr);
	//IShellFolderViewDual
    STDMETHODIMP get_Application(IDispatch **ppid);
    STDMETHODIMP get_Parent(IDispatch **ppid);
	STDMETHODIMP get_Folder(Folder **ppid);
	STDMETHODIMP SelectedItems(FolderItems **ppid);
	STDMETHODIMP get_FocusedItem(FolderItem **ppid);
	STDMETHODIMP SelectItem(VARIANT *pvfi, int dwFlags);
	STDMETHODIMP PopupItemMenu(FolderItem *pfi, VARIANT vx, VARIANT vy, BSTR *pbs);
	STDMETHODIMP get_Script(IDispatch **ppDisp);
    STDMETHODIMP get_ViewOptions(long *plViewOptions);
#ifdef _VISTA7
	//IExplorerBrowserEvents
	STDMETHODIMP OnNavigationPending(PCIDLIST_ABSOLUTE pidlFolder);
	STDMETHODIMP OnViewCreated(IShellView *psv);
	STDMETHODIMP OnNavigationComplete(PCIDLIST_ABSOLUTE pidlFolder);
	STDMETHODIMP OnNavigationFailed(PCIDLIST_ABSOLUTE pidlFolder);
	//IExplorerPaneVisibility
	STDMETHODIMP GetPaneState(REFEXPLORERPANE ep, EXPLORERPANESTATE *peps);
#endif
#ifdef _2000XP
	//IShellFolder
	STDMETHODIMP ParseDisplayName(HWND hwnd, IBindCtx *pbc, LPWSTR pszDisplayName, ULONG *pchEaten, PIDLIST_RELATIVE *ppidl, ULONG *pdwAttributes);
	STDMETHODIMP EnumObjects(HWND hwndOwner, SHCONTF grfFlags, IEnumIDList **ppenumIDList);
	STDMETHODIMP BindToObject(PCUIDLIST_RELATIVE pidl, IBindCtx *pbc, REFIID riid, void **ppvOut);
	STDMETHODIMP BindToStorage(PCUIDLIST_RELATIVE pidl, IBindCtx *pbc, REFIID riid, void **ppvOut);
	STDMETHODIMP CompareIDs(LPARAM lParam, PCUIDLIST_RELATIVE pidl1, PCUIDLIST_RELATIVE pidl2);
	STDMETHODIMP CreateViewObject(HWND hwndOwner, REFIID riid, void **ppv);
	STDMETHODIMP GetAttributesOf(UINT cidl, PCUITEMID_CHILD_ARRAY apidl, SFGAOF *rgfInOut);
	STDMETHODIMP GetUIObjectOf(HWND hwndOwner, UINT cidl, PCUITEMID_CHILD_ARRAY apidl, REFIID riid, UINT *rgfReserved, void **ppv);
	STDMETHODIMP GetDisplayNameOf(PCUITEMID_CHILD pidl, SHGDNF uFlags, STRRET *pName);
	STDMETHODIMP SetNameOf(HWND hwndOwner, PCUITEMID_CHILD pidl, LPCWSTR pszName, SHGDNF uFlags, PITEMID_CHILD *ppidlOut);
	//IShellFolder2
	STDMETHODIMP GetDefaultSearchGUID(GUID *pguid);
	STDMETHODIMP EnumSearches(IEnumExtraSearch **ppEnum);
	STDMETHODIMP GetDefaultColumn(DWORD dwReserved, ULONG *pSort, ULONG *pDisplay);
	STDMETHODIMP GetDefaultColumnState(UINT iColumn, SHCOLSTATEF *pcsFlags);
	STDMETHODIMP GetDetailsEx(PCUITEMID_CHILD pidl, const SHCOLUMNID *pscid, VARIANT *pv);
	STDMETHODIMP GetDetailsOf(PCUITEMID_CHILD pidl, UINT iColumn, SHELLDETAILS *psd);
	STDMETHODIMP MapColumnToSCID(UINT iColumn, SHCOLUMNID *pscid);
	//IShellFolderViewCB
	STDMETHODIMP MessageSFVCB(UINT uMsg, WPARAM wParam, LPARAM lParam);
#endif
	//IDropTarget
	STDMETHODIMP DragEnter(IDataObject *pDataObj, DWORD grfKeyState, POINTL pt, DWORD *pdwEffect);
	STDMETHODIMP DragOver(DWORD grfKeyState, POINTL pt, DWORD *pdwEffect);
	STDMETHODIMP DragLeave();
	STDMETHODIMP Drop(IDataObject *pDataObj, DWORD grfKeyState, POINTL pt, DWORD *pdwEffect);
	//IPersist
    STDMETHODIMP GetClassID(CLSID *pClassID);
	//IPersistFolder
    STDMETHODIMP Initialize(PCIDLIST_ABSOLUTE pidl);
	//IPersistFolder2
    STDMETHODIMP GetCurFolder(PIDLIST_ABSOLUTE *ppidl);
/*	//IContextMenu
	STDMETHODIMP QueryContextMenu(HMENU hmenu, UINT indexMenu, UINT idCmdFirst, UINT idCmdLast, UINT uFlags);
	STDMETHODIMP GetCommandString(UINT_PTR idCmd, UINT uFlags, UINT *pwReserved, LPSTR pszName, UINT cchMax);
	STDMETHODIMP InvokeCommand(LPCMINVOKECOMMANDINFO pici);
*/
	CteShellBrowser(CteTabs *pTabs);
	~CteShellBrowser();

	void Init(CteTabs *pTabs, BOOL bNew);
	void Show(BOOL bShow);
	VOID Suspend(BOOL bTree);
	VOID SetPropEx();
	VOID ResetPropEx();
	int GetTabIndex();
	VOID Close(BOOL bForce);
	VOID DestroyView(int nFlags);
	HWND GetListHandle(HWND *hList);
	BOOL Navigate1(FolderItem *pFolderItem, UINT wFlags, FolderItems *pFolderItems, LPITEMIDLIST pidlPrevius, LPITEMIDLIST *ppidl);
	VOID Navigate1Ex(LPOLESTR pstr, FolderItems *pFolderItems, UINT wFlags, LPITEMIDLIST pidlPrevius);
	HRESULT Navigate2(FolderItem *pFolderItem, UINT wFlags, DWORD *param, FolderItems *pFolderItems, LPITEMIDLIST pidlPrevius);
	HRESULT Navigate3(FolderItem *pFolderItem, UINT wFlags, DWORD *param, CteShellBrowser **ppSB, FolderItems *pFolderItems);
	HRESULT OnBeforeNavigate(FolderItem *pPrevius, UINT wFlags);
	void InitializeMenuItem(HMENU hmenu, LPTSTR lpszItemName, int nId, HMENU hmenuSub);
	VOID GetSort(BSTR* pbs);
	VOID SetSort(BSTR bs);
	HRESULT SetRedraw(BOOL bRedraw);
	HRESULT CreateViewWindowEx(IShellView *pPreviusView);
	BSTR GetColumnsStr();
	VOID GetDefaultColumns();
	BOOL GetAbsPidl(LPITEMIDLIST *pidlOut, FolderItem **ppid, FolderItem *pid, UINT wFlags, FolderItems *pFolderItems, LPITEMIDLIST pidlPrevius);
	VOID EBNavigate();
	VOID SetHistory(FolderItems *pFolderItems, UINT wFlags);
	VOID GetVariantPath(FolderItem **ppFolderItem, FolderItems **ppFolderItems, VARIANT *pv);
	VOID HookDragDrop(int nMode);
	VOID Error(FolderItem *pid, DWORD dwTick);
	VOID Refresh();
public:
	BOOL		m_bEmpty, m_bInit;
	BOOL		m_bNoRowSelect;
	BOOL		m_bVisible;
	DWORD		m_nOpenedType;
	HWND		m_hwnd;
	HWND		m_hwndDV;
	HWND		m_hwndLV;
	CteTabs		*m_pTabs;
	CteTreeView	*m_pTV;
	LONG_PTR	m_DefProc;
	IShellView  *m_pShellView;
	int			m_nSB;
	DWORD		m_param[SB_Count];
	IDispatch	*m_pOnFunc[1];
	UINT		m_nColumns;
	TEColumn	*m_pColumns;
	VARIANT		m_vRoot;
	LPITEMIDLIST m_pidl;
	FolderItem *m_pFolderItem;
	int			m_nUnload;
	IExplorerBrowser *m_pExplorerBrowser;
	CteServiceProvider *m_pServiceProvider;
private:
	LONG		m_cRef;
	VARIANT m_Data;
	DWORD		m_dwEventCookie;
	FolderItem	**m_ppLog;
	int			m_nLogCount;
	int			m_nLogIndex;
	BSTR		m_bsFilter;
	IDispatch	*m_pDSFV;
	IShellFolder2 *m_pSF2;
	UINT		m_nDefultColumns;
	PROPERTYKEY *m_pDefultColumns;
	IDropTarget *m_pDropTarget;
	CteFolderItems *m_pDragItems;
	DWORD m_grfKeyState;
	HRESULT		m_DragLeave;
	BOOL		m_bIconSize;
	LONG		m_nCreate;
};

class CteMemory : public IDispatchEx
{
public:
	STDMETHODIMP QueryInterface(REFIID riid, void **ppvObject);
	STDMETHODIMP_(ULONG) AddRef();
	STDMETHODIMP_(ULONG) Release();
	//IDispatch
	STDMETHODIMP GetTypeInfoCount(UINT *pctinfo);
	STDMETHODIMP GetTypeInfo(UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo);
	STDMETHODIMP GetIDsOfNames(REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId);
	STDMETHODIMP Invoke(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr);
	//IDispatchEx
	STDMETHODIMP GetDispID(BSTR bstrName, DWORD grfdex, DISPID *pid);
	STDMETHODIMP InvokeEx(DISPID id, LCID lcid, WORD wFlags, DISPPARAMS *pdp, VARIANT *pvarRes, EXCEPINFO *pei, IServiceProvider *pspCaller);
	STDMETHODIMP DeleteMemberByName(BSTR bstrName, DWORD grfdex);
	STDMETHODIMP DeleteMemberByDispID(DISPID id);
	STDMETHODIMP GetMemberProperties(DISPID id, DWORD grfdexFetch, DWORD *pgrfdex);
	STDMETHODIMP GetMemberName(DISPID id, BSTR *pbstrName);
	STDMETHODIMP GetNextDispID(DWORD grfdex, DISPID id, DISPID *pid);
	STDMETHODIMP GetNameSpaceParent(IUnknown **ppunk);

	VOID ItemEx(int i, VARIANT *pVarResult, VARIANT *pVarNew);
	BSTR AddBSTR(BSTR bs);
	VOID Read(int nIndex, int nLen, VARIANT *pVarResult);
	VOID Write(int nIndex, int nLen, VARTYPE vt, VARIANT *pv);
	int GetLong(int nIndex);
	void SetLong(int nIndex, int nValue);
	void Free();

	CteMemory(int nSize, char *pc, int nMode, int nCount, LPWSTR lpStruct);
	~CteMemory();
public:
	char	*m_pc;
	int		m_nSize;
	int		m_nCount;
private:
	LONG	m_cRef;
	int		m_nAlloc;
	int		m_nMode;
	BSTR	m_bsStruct;
	BSTR	*m_ppbs;
	int		m_nbs;
};

class CteContextMenu : public IDispatch
{
public:
	STDMETHODIMP QueryInterface(REFIID riid, void **ppvObject);
	STDMETHODIMP_(ULONG) AddRef();
	STDMETHODIMP_(ULONG) Release();
	//IDispatch
	STDMETHODIMP GetTypeInfoCount(UINT *pctinfo);
	STDMETHODIMP GetTypeInfo(UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo);
	STDMETHODIMP GetIDsOfNames(REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId);
	STDMETHODIMP Invoke(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr);

	CteContextMenu(IUnknown *punk, IDataObject *pDataObj);
	~CteContextMenu();

	LRESULT HandleMenuMessage(MSG *pMsg);
public:
	IContextMenu *m_pContextMenu;
	CteShellBrowser *m_pShellBrowser;
	CteDll *m_pDll;
private:
	LONG	m_cRef;
	IDataObject *m_pDataObj;
};

class CteDropTarget : public IDispatch
{
public:
	STDMETHODIMP QueryInterface(REFIID riid, void **ppvObject);
	STDMETHODIMP_(ULONG) AddRef();
	STDMETHODIMP_(ULONG) Release();
	//IDispatch
	STDMETHODIMP GetTypeInfoCount(UINT *pctinfo);
	STDMETHODIMP GetTypeInfo(UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo);
	STDMETHODIMP GetIDsOfNames(REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId);
	STDMETHODIMP Invoke(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr);

	CteDropTarget(IDropTarget *pDropTarget, LPITEMIDLIST pidl);
	~CteDropTarget();
private:
	LONG	m_cRef;
	IDropTarget *m_pDropTarget;
	LPITEMIDLIST m_pidl;
};

class CteTreeView : public IDispatch,
#ifdef _VISTA7
	public INameSpaceTreeControlEvents,
#endif
#ifdef _2000XP
	public IOleClientSite, public IOleInPlaceSite,
#endif
	public IDropTarget
{
public:
	STDMETHODIMP QueryInterface(REFIID riid, void **ppvObject);
	STDMETHODIMP_(ULONG) AddRef();
	STDMETHODIMP_(ULONG) Release();
	//IDispatch
	STDMETHODIMP GetTypeInfoCount(UINT *pctinfo);
	STDMETHODIMP GetTypeInfo(UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo);
	STDMETHODIMP GetIDsOfNames(REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId);
	STDMETHODIMP Invoke(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr);
#ifdef _VISTA7
	//INameSpaceTreeControlEvents
	STDMETHODIMP OnItemClick(IShellItem *psi, NSTCEHITTEST nstceHitTest, NSTCSTYLE nsctsFlags);
	STDMETHODIMP OnPropertyItemCommit(IShellItem *psi);
	STDMETHODIMP OnItemStateChanging(IShellItem *psi, NSTCITEMSTATE nstcisMask, NSTCITEMSTATE nstcisState);
	STDMETHODIMP OnItemStateChanged(IShellItem *psi, NSTCITEMSTATE nstcisMask, NSTCITEMSTATE nstcisState);
	STDMETHODIMP OnSelectionChanged(IShellItemArray *psiaSelection);
	STDMETHODIMP OnKeyboardInput(UINT uMsg, WPARAM wParam, LPARAM lParam);
	STDMETHODIMP OnBeforeExpand(IShellItem *psi);
	STDMETHODIMP OnAfterExpand(IShellItem *psi);
	STDMETHODIMP OnBeginLabelEdit(IShellItem *psi);
	STDMETHODIMP OnEndLabelEdit(IShellItem *psi);
	STDMETHODIMP OnGetToolTip(IShellItem *psi, LPWSTR pszTip, int cchTip);
	STDMETHODIMP OnBeforeItemDelete(IShellItem *psi);
	STDMETHODIMP OnItemAdded(IShellItem *psi, BOOL fIsRoot);
	STDMETHODIMP OnItemDeleted(IShellItem *psi, BOOL fIsRoot);
	STDMETHODIMP OnBeforeContextMenu(IShellItem *psi, REFIID riid, void **ppv);
	STDMETHODIMP OnAfterContextMenu(IShellItem *psi, IContextMenu *pcmIn, REFIID riid, void **ppv);
	STDMETHODIMP OnBeforeStateImageChange(IShellItem *psi);
	STDMETHODIMP OnGetDefaultIconIndex(IShellItem *psi, int *piDefaultIcon, int *piOpenIcon);
#endif
#ifdef _2000XP
	//IOleClientSite
	STDMETHODIMP SaveObject();
	STDMETHODIMP GetMoniker(DWORD dwAssign, DWORD dwWhichMoniker, IMoniker **ppmk);
	STDMETHODIMP GetContainer(IOleContainer **ppContainer);
	STDMETHODIMP ShowObject();
	STDMETHODIMP OnShowWindow(BOOL fShow);
	STDMETHODIMP RequestNewObjectLayout();
	//IOleInPlaceSite
	STDMETHODIMP GetWindow(HWND *phwnd);
	STDMETHODIMP ContextSensitiveHelp(BOOL fEnterMode);
	STDMETHODIMP CanInPlaceActivate();
	STDMETHODIMP OnInPlaceActivate();
	STDMETHODIMP OnUIActivate();
	STDMETHODIMP GetWindowContext(IOleInPlaceFrame **ppFrame, IOleInPlaceUIWindow **ppDoc, LPRECT lprcPosRect, LPRECT lprcClipRect, LPOLEINPLACEFRAMEINFO lpFrameInfo);
	STDMETHODIMP Scroll(SIZE scrollExtant);
	STDMETHODIMP OnUIDeactivate(BOOL fUndoable);
	STDMETHODIMP OnInPlaceDeactivate();
	STDMETHODIMP DiscardUndoState();
	STDMETHODIMP DeactivateAndUndo();
	STDMETHODIMP OnPosRectChange(LPCRECT lprcPosRect);
#endif
	//IDropTarget
	STDMETHODIMP DragEnter(IDataObject *pDataObj, DWORD grfKeyState, POINTL pt, DWORD *pdwEffect);
	STDMETHODIMP DragOver(DWORD grfKeyState, POINTL pt, DWORD *pdwEffect);
	STDMETHODIMP DragLeave();
	STDMETHODIMP Drop(IDataObject *pDataObj, DWORD grfKeyState, POINTL pt, DWORD *pdwEffect);
	//IPersist
    STDMETHODIMP GetClassID(CLSID *pClassID);
	//IPersistFolder
    STDMETHODIMP Initialize(PCIDLIST_ABSOLUTE pidl);
	//IPersistFolder2
    STDMETHODIMP GetCurFolder(PIDLIST_ABSOLUTE *ppidl);

	CteTreeView();
	~CteTreeView();

	void Init();
	void Close();
	BOOL Create();
#ifdef _2000XP
	HRESULT NSInvoke(LPWSTR szVerb, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult);
#endif
	HRESULT getSelected(IDispatch **pItem);
	HRESULT SetRoot();
public:
	BOOL		m_bSetRoot;
	HWND        m_hwnd;
	HWND        m_hwndTV;
	INameSpaceTreeControl	*m_pNameSpaceTreeControl;
	CteShellBrowser	*m_pFV;
	WNDPROC		m_DefProc;
	WNDPROC		m_DefProc2;
	BOOL		m_bMain;
	IDropTarget *m_pDropTarget;
#ifdef _2000XP
	IShellNameSpace *m_pShellNameSpace;
#endif
private:
	LONG	m_cRef;
	VARIANT m_Data;
	int		m_nType, m_nOpenedType;
	LPWSTR	lplpVerbs;
	CteFolderItems *m_pDragItems;
	DWORD	m_grfKeyState;
	HRESULT m_DragLeave;
#ifdef _VISTA7
	DWORD	m_dwCookie;
#endif
//	DWORD   m_dwEventCookie;
#ifdef _W2000
	VARIANT m_vSelected;
#endif
};

class CteCommonDialog : public IDispatch
{
public:
	STDMETHODIMP QueryInterface(REFIID riid, void **ppvObject);
	STDMETHODIMP_(ULONG) AddRef();
	STDMETHODIMP_(ULONG) Release();
	//IDispatch
	STDMETHODIMP GetTypeInfoCount(UINT *pctinfo);
	STDMETHODIMP GetTypeInfo(UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo);
	STDMETHODIMP GetIDsOfNames(REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId);
	STDMETHODIMP Invoke(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr);

	CteCommonDialog();
	~CteCommonDialog();
private:
	LONG	m_cRef;
	OPENFILENAME m_ofn;
};

class CteGdiplusBitmap : public IDispatch
{
public:
	STDMETHODIMP QueryInterface(REFIID riid, void **ppvObject);
	STDMETHODIMP_(ULONG) AddRef();
	STDMETHODIMP_(ULONG) Release();
	//IDispatch
	STDMETHODIMP GetTypeInfoCount(UINT *pctinfo);
	STDMETHODIMP GetTypeInfo(UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo);
	STDMETHODIMP GetIDsOfNames(REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId);
	STDMETHODIMP Invoke(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr);

	CteGdiplusBitmap();
	~CteGdiplusBitmap();
private:
	LONG	m_cRef;
	Gdiplus::Bitmap *m_pImage;
};

class CteWindowsAPI : public IDispatch
{
public:
	STDMETHODIMP QueryInterface(REFIID riid, void **ppvObject);
	STDMETHODIMP_(ULONG) AddRef();
	STDMETHODIMP_(ULONG) Release();
	//IDispatch
	STDMETHODIMP GetTypeInfoCount(UINT *pctinfo);
	STDMETHODIMP GetTypeInfo(UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo);
	STDMETHODIMP GetIDsOfNames(REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId);
	STDMETHODIMP Invoke(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr);

	CteWindowsAPI();
	~CteWindowsAPI();
private:
	LONG	m_cRef;
};

class CteDispatch : public IDispatch, public IEnumVARIANT
{
public:
	STDMETHODIMP QueryInterface(REFIID riid, void **ppvObject);
	STDMETHODIMP_(ULONG) AddRef();
	STDMETHODIMP_(ULONG) Release();
	//IDispatch
	STDMETHODIMP GetTypeInfoCount(UINT *pctinfo);
	STDMETHODIMP GetTypeInfo(UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo);
	STDMETHODIMP GetIDsOfNames(REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId);
	STDMETHODIMP Invoke(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr);
	//IEnumVARIANT
	STDMETHODIMP Next(ULONG celt, VARIANT *rgVar, ULONG *pCeltFetched);
	STDMETHODIMP Skip(ULONG celt);
	STDMETHODIMP Reset(void);
	STDMETHODIMP Clone(IEnumVARIANT **ppEnum);

	CteDispatch(IDispatch *pDispatch, int nMode);
	~CteDispatch();

	DISPID		m_dispIdMember;
	int			m_nIndex;
	IActiveScript *m_pActiveScript;
private:
	LONG		m_cRef;
	IDispatch	*m_pDispatch;
	int			m_nMode;//0: Clone 1:collection 2:ScriptDispatch
};

class CteActiveScriptSite : public IActiveScriptSite, public IActiveScriptSiteWindow
{
public:
	STDMETHODIMP QueryInterface(REFIID riid, void **ppvObject);
	STDMETHODIMP_(ULONG) AddRef();
	STDMETHODIMP_(ULONG) Release();

	CteActiveScriptSite(IUnknown *punk, IUnknown *pOnError);
	~CteActiveScriptSite();
	//ActiveScriptSite
	STDMETHODIMP GetLCID(LCID *plcid);
	STDMETHODIMP GetItemInfo(LPCOLESTR pstrName,
                           DWORD dwReturnMask,
                           IUnknown **ppiunkItem,
                           ITypeInfo **ppti);
	STDMETHODIMP GetDocVersionString(BSTR *pbstrVersion);
	STDMETHODIMP OnScriptError(IActiveScriptError *pscripterror);
	STDMETHODIMP OnStateChange(SCRIPTSTATE ssScriptState);
	STDMETHODIMP OnScriptTerminate(const VARIANT *pvarResult,const EXCEPINFO *pexcepinfo);
	STDMETHODIMP OnEnterScript(void);
	STDMETHODIMP OnLeaveScript(void);
	//IActiveScriptSiteWindow
	STDMETHODIMP GetWindow(HWND *phwnd);
	STDMETHODIMP EnableModeless(BOOL fEnable);

public:
	LONG		m_cRef;
	IDispatchEx	*m_pDispatchEx;
	IDispatch *m_pOnError;
};

#ifdef _USE_TESTOBJECT
class CteTest : public IDispatch
{
public:
	STDMETHODIMP QueryInterface(REFIID riid, void **ppvObject);
	STDMETHODIMP_(ULONG) AddRef();
	STDMETHODIMP_(ULONG) Release();
	//IDispatch
	STDMETHODIMP GetTypeInfoCount(UINT *pctinfo);
	STDMETHODIMP GetTypeInfo(UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo);
	STDMETHODIMP GetIDsOfNames(REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId);
	STDMETHODIMP Invoke(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr);

	CteTest();
	~CteTest();
public:
	LONG	m_cRef;
};
#endif