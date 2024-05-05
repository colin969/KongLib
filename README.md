# KongLib

Designed to replace the existing Kongregate JS API and allow integration with the Flash API. Modern HTML game compatability is not a goal of the project. It's built to be slim, without external dependencies. (This may change if other Connection implementations are added in the future)

Makes modifications required to integrate with Ruffle. Resulting modified SWF files will not work on the official Kong site without Javascript injection.

The packaged Ruffle files are been built with changes to allow AS2 games to function. These are not required for AS3 games. It is not available upstream yet.

*If you're looking for JavaScript changes which will allow the modified Flash APIs to work on the official Kongregate JS API / Website, please see https://github.com/colin969/Kongregate-Patched-APIs/*

## Supported Opcodes

- `hello`
- `stats.submit`
- `mtx.item_instances` - stub

## Sidebar

The sidebar is built to `www/sidebar.js` and `www/sidebar.css`, it can be included on a page and loaded with `loadGameSidebar(<elemId>);` as long as it's loaded after `api.js`. 
It will display associated data such as game stats and badge statuses. This is not required for KongLib to function and you're free to write your elements to display this info on a page.

## Development

See `setup` for setting up useful local files.

Install deps
`npm install`

Build:
`npm run build`

Run dev server:
`npm run dev`

## Flash API Modifications

Modify using JPEXS

Stock AS3: https://chat.kongregate.com/flash/API_AS3_d43c4b859e74432475c1627346078677.swf - Test loc: `/www/API_AS3_MODIFIED.swf`

Replace `com.kongregate.as3.client.services.KongregateServices L565` with `result = ExternalInterface.call("window.flashApiBootstrap",swfId,apiUrl);`

Replace `com.kongregate.as3.common.comm.external.ExternalMessageConnection L56` with `ExternalInterface.call("window.flashApiSendMessage",param1.getOpcode(),_loc3_);`

----

Stock AS2: http://api.kongregate.com/flash/API_f99fa1a5a43e48224ae2c0177064456d.swf - Test lock: `/www/API_AS2_MODIFIED.swf`

Replace `com.kongregate.client.KongregateServices L420` with `var _loc3_ = flash.external.ExternalInterface.call("window.flashApiBootstrap",_loc2_);`

Replace `com.kongregate.common.comm.external.ExternalMessageConnection L72` with `flash.external.ExternalInterface.call("window.flashApiSendMessage",msg.getOpcode(),_loc4_);`

