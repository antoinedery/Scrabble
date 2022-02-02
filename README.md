<td><h1>Scrabble</h1></td>

Scrabble game made as part of the Web Application Software Project course (LOG2990) at Polytechnique Montréal.

To visit the deployed site: [https://antoinedery.github.io/Scrabble/](https://antoinedery.github.io/Scrabble/)

Note : the multiplayer mode might not work on this deployed version (you can still play on solo mode!)

### Prerequisites
* Install [Node/npm](https://nodejs.org/en/download/)
* Install TypeScript
   ```sh
   npm install typescript –g
   ```
* Install npm dependencies in each folder (server and client)
   ```sh
   npm ci
   ```
   
### Instructions to play Scrabble    
1. Clone the repo
   ```sh
   git clone https://github.com/antoinedery/Scrabble.git
   ```
2. Open terminal in the server folder
3. Launch the server
   ```sh
   npm start
   ```
4. Open another terminal in the client folder
5. Launch the client app
   ```sh
   npm start
   ```
   
### Instructions to run the unit tests  
1. Open terminal in the desired folder (server or client)
2. Launch the tests (this will also show the code coverage)
   ```sh
   npm run coverage
   ``` 
