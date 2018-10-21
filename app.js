const { app, BrowserWindow, dialog, Menu, platform, session, Tray } = require('electron') // http://electron.atom.io/docs/api

const path = require('path')

require('electron-context-menu')({
  prepend: (params, browserWindow) => []
})

let window = null
let appIcon = null
let trayIcon = null

// Temporary fix broken high-dpi scale factor on Windows (125% scaling)
// info: https://github.com/electron/electron/issues/9691
if (process.platform === 'win32') {
  app.commandLine.appendSwitch('high-dpi-support', 'true')
  app.commandLine.appendSwitch('force-device-scale-factor', '1')
}

if (platform == 'darwin') {
  trayIcon = path.join(__dirname, 'assets/imu.png')
} else if (platform == 'win32') {
  trayIcon = path.join(__dirname, 'assets/imu.ico')
} else {
  trayIcon = path.join(__dirname, 'assets/imu.ico')
}

// session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
//   details.requestHeaders['User-Agent'] = 'SuperDuperAgent'
//
//   callback({ cancel: false, requestHeaders: details.requestHeaders })
// })

// Wait until the app is ready
app.once('ready', () => {
  // Create a new window
  window = new BrowserWindow({
    // Set the initial width to 767px
    width: 767,
    // Set the initial height to 667px
    height: 667,
    // Don't show the window until it ready, this prevents any white flickering
    show: false,
    icon: trayIcon,
    title: 'IMU',
    toolbar: true,
    webPreferences: {
      // Disable node integration in remote page
      nodeIntegration: false
    }
  })

  // URL is argument to npm start
  const url = 'https://instagram.com' // process.argv[2]

  // Query all cookies associated with a specific url.
  session.defaultSession.cookies.get({}, (error, cookies) => {
    // console.log(error, cookies)
  })


  // Function for clearing cache
  const win = BrowserWindow.getAllWindows()[0]
  const ses = win.webContents.session
  const clearAppCache = () => {
    ses.clearCache(() => {
      dialog.showMessageBox({type: 'info', buttons: ['OK'], message: 'Başarılı.'})
    })
  }

  // Template for menu
  const menuTemplate = [
    {
      label: 'Düzen',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'delete'}
      ]
    },
    {
      label: 'Görünüm',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'}
      ]
    },
    {
      role: 'window',
      submenu: [
        {role: 'minimize'},
        {role: 'close'}
      ]
    },
    {
      label: 'Bakım',
      submenu: [
        {
          label: 'Geçmişi Temizle',
          click: () => {window.webContents.clearHistory(dialog.showMessageBox({type: 'info', buttons: ['OK'], message: 'Başarılı.'}))}
        },
        {
          label: 'Önbelleği Temizle',
          click: () => {clearAppCache()}
        },
        {
          label: 'Depolamayı Temizle',
          click: () => {window.webContents.session.clearStorageData(dialog.showMessageBox({ type: 'info', buttons: ['OK'], message: 'Başarılı.'}))}
        },
        {
          label: 'Önbellek boyutu',
          click: () => {window.webContents.session.getCacheSize((size) => dialog.showMessageBox({type: 'info', buttons: ['OK'], message: `Cache size is: ${size} bytes.`}))}
        },
        {
          label: 'Geliştirici',
          click: () => {require('electron').shell.openExternal('https://github.com/bikalab/imu')}
        }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Hata Bildir',
          click: () => {require('electron').shell.openExternal('https://github.com/bikalab/imu/issues')}
        },
        {
          label: 'IMU Hakkında',
          click: () => {require('electron').shell.openExternal('https://bikalab.com')}
        }
      ]
    }
  ]

  // Build menu from menuTemplate
  const menu = Menu.buildFromTemplate(menuTemplate)

  // Set menu to menuTemplate
  Menu.setApplicationMenu(menu)

  // Create tray icon
  appIcon = new Tray(trayIcon)

  // Create RightClick context menu for tray icon
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Geri yükle',
      click: () => {
        window.show()
      }
    },
    {
      label: 'Kapat',
      click: () => {
        window.close()
      }
    }
  ])

  // Set title for tray icon
  appIcon.setTitle('IMU')

  // Set toot tip for tray icon
  appIcon.setToolTip('IMU')

  // Create RightClick context menu
  appIcon.setContextMenu(contextMenu)

  // Always highlight the tray icon
  appIcon.setHighlightMode('always')

  // The tray icon is not destroyed
  appIcon.isDestroyed(false)

  // Restore (open) app after clicking on tray icon
  // if window is already open, minimize it to system tray
  appIcon.on('click', () => {
    window.isVisible() ? window.hide() : window.show()
  })

  window.loadURL(url, {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B137 Safari/601.1'
  })

  // Emitted when the window is closed.
  window.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    window = null
  })

  // Minimize window to system tray
  window.on('minimize',function(event){
    event.preventDefault()
    // window.minimize()
    window.hide()
})

  // Show window when page is ready
  window.once('ready-to-show', () => {
    // window.maximize()
    window.show()

    // Open the DevTools.
    if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV.trim() === 'dev') {
      window.webContents.openDevTools()
    }
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q

  if (process.platform !== 'darwin') {
    app.quit()
  }
})
