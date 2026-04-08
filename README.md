# jest0.2

```text
//-------------------------------------------------------
//              ██╗███████╗███████╗████████╗ ®
//              ██║██╔════╝██╔════╝╚══██╔══╝
//              ██║█████╗  ███████╗   ██║
//         ██   ██║██╔══╝  ╚════██║   ██║
//         ╚█████╔╝███████╗███████║   ██║
//          ╚════╝ ╚══════╝╚══════╝   ╚═╝
//-------------------------------------------------------
// JEST® Engine • by Antago • Copyright© since 1999-2026
//-------------------------------------------------------

JEST® Game Engine v0.2 (formerly Gravity)
by Antago (God of Gravity) • author of Graal2001 & Destiny

//-------------------------------------------------------
       DEVELOPER NOTES • CHANGES from v0.1 to v0.2
//-------------------------------------------------------

• Includes a Websocket class for plugging into a remote server.
  - accessed via the _JestOnline_ class

• Data can be synchronized to your custom cloud server using _JestCloud_ (very beta).

• A beta account system with a generic PHP login now exists.
  - mostly for creator applications
  - will integrate into _JestPlay_ later

• Application can optionally be wrapped inside Electron (desktop/mobile).

• Load order is handled in load_order.txt
  - generate via **/build_js_bundle.py**

• New UI system for form building.

• Includes:
  - Tile Editor
  - Sprite Animator
    → splice spritesheets into animation sequences

  Located in:
  /js/jest/app/clients

  Toggle app in:
  /js/embed/embed.js

• Game worlds defined as JSON (multiverse-ready).

• All files now handled by JestFileLoader system
  - example:
    /js/apps/jest/components/file/JestFileLoader.js

• Image system:
  JestImager → extends JestFileLoader
  JestGraphic → wraps image data

• Lots of other changes.
```
