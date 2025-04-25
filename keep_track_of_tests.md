TODO: Try testing the endpoint with Postman. 
TODO: Try testing from browser. 
TODO: Try looking at my Grok console. 

STATE OF THE UNION: 
It was that my tokens were out, so I had to buy more. After that, the requests started working. 



STATE OF THE UNION: 

Correct: 
It finds and labels the user 
It finds places near the user (somewhat)

Bugs: 
It zooms in on San Francisco even when it correctly places the blue dot on the user
Increase the accuracy through prompt engineering. 

TODO: Fix these bugs. 



# TODAY 2025-04-25 09:51:40

TODO: Do a state of the union. 

State of the union: It now shows a more accurate spot for your own location. 

TODO: Use a third party API to get our actual street location instead of latitude and longitude. 



# APP MAP 

Entry Point: _layout.tsx 
-> 
(tabs) / index.tsx
-> 
returns a MapView
-> 
shows user location 

Maps all of the pizza places onto the map. 

Shows a list of all of the pizza places in a cute little list. 


buildUserPrompt and SYSTEM_PROMPT
<- 
pizzaService.ts
<- 
usePizzaPlaces hook. 
It's a useEffect that runs on mount. 
<- 
index.ts