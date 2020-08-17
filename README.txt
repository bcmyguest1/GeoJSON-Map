Description:
NOTE: I tried to prioritize functionality and good design over the looks of the application so please don't be too harsh :)
Application used for displaying, listing and filtering geojson data from a given data source. Uses uni-directional data flow and raised state in accordance with react specifications.
There is a geojson controller component used to update information in the table and map of the json information. When sub-components need to send updates, they are hooked on to the main controller's update functions rather than them implementing their own data state (they may have their own state but this is more due to development time restrictions/ease of development)


Map:
To create the map, react-leaflet was chosen due to its ability to support multiple map interfaces (eg. google maps, OpenStreetMaps, etc.) and use of open source code.

Possible Improvements: Although highly customizable, most of react-leaflet was not used to create a better looking application, expected functionality was prioritized rather than design.

Filtering and listing:
For now, uses basic state management from stock react using a controller component which passes down to sub-components actions which can effect the state of the store (and cause a re-render of the application)

Possible improvements: In the future, an additional library, like redux/alt.js, could be used to manage the state of the application including the "cart/checkout" functionality which was an intitial requirement but has been cut in the interest of time

Cart/Checkout:

Although this was not implemented, here is the basic methodology behind designing a store with react for this purpose. Since customers likely would benefit from the storage of carts between sessions (with expiry), the best way to tackle this issue is to have some implementation of a cart on the backend which is then accessed by the client through redux/alt.js (or some other react data store). This would allow for both consistent carts accross different tabs and different sessions (ie. if the tab was closed accidentally). If only the tab constraint was needed, the information could have been stored in the cookie accessed accross multiple browser tabs, again depending on what information is needed to be stored on the client side, we could determine whether the use of a store would be necessary (it would likely cut overall complexity of the application).

Once the idea of a cart is established (through the above methodology), either a current provider for checkout (eg. shopify) or a basic implementation of transaction system could be made. I'm not exactly sure what the clients are (do they pay for the service? are they logged in? etc.) in need of for this page. 

Additional considerations: How does the client know when their data is ready? How do they access it? How do they know that their order succeeded (probably a confirmation number stored on our backend and given to them)? Are past orders tracked - we wouldn't want a client to pay for the same thing twice?

Useful additional requirements: Click on table should go to the point on the map if possible, click on map should scroll to and highlight the the table entry, while the map should stay displayed
Other notes: all elements should have either id or class associated with them for styling purposes

Install Requirements
-relatively up to date version of node/node package manager (npm)
-in the main project folder run `npm install` (see package.json for dependencies)

Run Command
-`npm start` will start a local server at port 3000
