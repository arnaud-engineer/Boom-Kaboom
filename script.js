		/*  ---------------
			 DEMO
			--------------- */


/*  =========================================================================
	 GLOBAL VARIABLES
	========================================================================= */

	// STEPS
	var step = 0;

	// INPUT HISTORY
	var currentInput = "";
	var inputHist = [""];
	var inputHistIndex = 1;
	var submittedInput = false;
	var currentText = "";
	var secretInput = false;
	var cursorPosition = 1;



	var inputDetection = false;

	// BASIC TOUCHES

	var qDown = false;
	var pDown = false;

	var qCode = "KeyQ";
	var pCode = "KeyP";
	var qName = "Q";
	var pName = "P";

	// SHORTCUTS TOUCHES

	var ctrlDown = false; // 17 ControlLeft ControlRight
	var altDown = false; // 18 AltLeft AltRight
	var shiftDown = false; // 16 ShiftLeft ShiftRight
	var zeroDown = false;
	var oneDown = false;


	// KEYBOARD DETECTION
	var keyboardDetected = false;
	var keyboardModel;
	var keyboardPossibleModel = ["QWERTY", "QWERTZ", "AZERTY"];

	// LANGUAGE
	var language = "UNDETECTED"; // default
	var text;

	// COUNTDOWN

	var countdown;
	var countdownSeconds = 30;
	var countdownRest = 1;




	// coordonnates
	var longitude;
	var latitude;

	var protocol99 = false;

	var isPresident = false;
	var isRoot = false;

	var isConnectingAsPresident = false;
	var isConnectingAsRoot = false;







	var isBepo = false;



	function bepoOn() {
		isBepo = true;
		if(keyboardModel == "AZERTY") {
			qCode = "KeyA";
		}
		else {
			qCode = "KeyM";
		}
		pCode = "KeyE";

		if(protocol99 == true) {
			countdownRefresh();
		}
	}

	function bepoOff() {
		isBepo = false;
		qCode = "KeyQ";
		pCode = "KeyP";

		if(protocol99 == true) {
			countdownRefresh();
		}
	}


/*  =========================================================================
	 FULLSCREEN
	========================================================================= */

	var fullscreenStatus = false;

	function goFullScreen() {
		fullscreenStatus = true;
		var body = document.getElementsByTagName("body")[0];
		body.requestFullscreen();
	}

	function endFullScreen() {
		document.exitFullscreen();
		fullscreenStatus = false;
	}


/*  =========================================================================
	 INPUTS
	========================================================================= */


		function startSecretInput()	{ secretInput = true; }
		function stopSecretInput()	{ secretInput = false; }

	/*  ----------------------------------------
		 NEW LINE (NORMAL | INPUT LINE)
		---------------------------------------- */

		async function newLine(text)
		{
			// CURENT TEXT SETTING
			currentText = text;

			// NEW LINE CREATION
			var el = document.createElement("div");
			el.innerHTML = "";
			el.setAttribute("id","current-line");
			var precEl = document.getElementById("current-line");
			precEl.removeAttribute("id");
			insertAfter(el, precEl);

			// TEXT ANIMATION
			await textAnimation(el, text);
		}

		async function newInputLine(text)
		{
			currentText = text;

			var el = document.createElement("div");
			el.setAttribute("id","current-line");
			var precEl = document.getElementById("current-line");
			precEl.removeAttribute("id");
			insertAfter(el, precEl);
			
			await textAnimation(el, text);
			inputUpdate("", ""); // to display cursor
			scrollToPageEnd();

			if(inputHistIndex == inputHist.length) {
				inputHistIndex++;
			}
			inputHist.push("");
			currentInput = "";
			moveCursor(1);
		}

			// TEXT LAG ANIMATION
			async function textAnimation(el, text)
			{
				for(let i = 0 ; i <= text.length ; i++) {
					el.innerHTML = text.substring(0,i);
					await new Promise(r => setTimeout(r, 8));
					scrollToPageEnd();
				}
			}

	/*  ----------------------------------------
		 KEY DETECTION (START | STOP)
		---------------------------------------- */

		function detectLanguage()
		{
			var userLang = navigator.language || navigator.userLanguage; 
			if(userLang == "fr" || userLang == "fr-be" || userLang == "fr-ca" || userLang == "fr-fr" || userLang == "fr-lu" || userLang == "fr-mc" || userLang == "fr-ch") {
				language = "Français";
				text = text_fr;
			}
			else {
				language = "English";
				text = text_en;
			}
		}

		function detectKeyboardModel(code, carac)
		{
			if(code == "KeyA") {
				if(carac == "Q" || carac == "q") {
					keyboardPossibleModel.splice(0,2); // AZERTY
				}
				else if(carac == "A" || carac == "a") {
					keyboardPossibleModel.splice(2,1); // NOT AZERTY
				}
			}
			else if(code == "KeyQ") {
				if(carac == "Q" || carac == "q") {
					keyboardPossibleModel.splice(2,1); // NOT AZERTY
				}
				else if(carac == "A" || carac == "a") {
					keyboardPossibleModel.splice(0,2); // AZERTY
				}
			}
			else if(code == "KeyY") {
				if(carac == "Y" || carac == "y") {
					keyboardPossibleModel.splice(1,1); // NOT QWERTZ
				}
				else if(carac == "Z" || carac == "z") {
					keyboardPossibleModel.splice(2,1); // QWERTZ
					keyboardPossibleModel.splice(0,1);
				}
			}
			else if(code == "KeyZ") {
				if(carac == "Z" || carac == "z") {
					keyboardPossibleModel.splice(1,2); // QWERTY
				}
				else if(carac == "Y" || carac == "y") {
					keyboardPossibleModel.splice(2,1); // QWERTZ
					keyboardPossibleModel.splice(0,1);
				}
				else if(carac == "W" || carac == "w") {
					keyboardPossibleModel.splice(0,2); // AZERTY
				}
			}

			if(keyboardPossibleModel.length == 1) {
				keyboardModel = keyboardPossibleModel[0];
				keyboardDetected = true;

				if(keyboardModel == "AZERTY") {
					qName = "A";
				}
				else if(keyboardModel == "QWERTY" || keyboardModel == "QWERTZ") {
					qName = "Q";
				}
			}
		}

		function startKeyDetection()
		{
			inputDetection = true;

			document.onkeydown = function (e) {
				var code = e.code; // ex : "KeyQ"
				var carac = e.key; // ex : "Q" (QUERTY) or "A" (AZERTY)
				console.log('"' + code + '" ("' + carac + '")');

				if(keyboardDetected == false) {
					detectKeyboardModel(code, carac);
				}

				// 2 TOUCHES
				if(code == qCode) {
					// INPUT ONLY THE FIRST PRESS IF HELD
					if(inputDetection == true && qDown == false) {
						inputUpdate(code, carac);
					}
					qDown = true;
					stateUpdate();
				}
				else if(code == pCode) {
					if(inputDetection == true && pDown == false) {
						inputUpdate(code, carac);
					}
					pDown = true;
					stateUpdate();
				}
				else if(code == "Digit0") {
					if(inputDetection == true && zeroDown == false) {
						inputUpdate(code, carac);
					}
					zeroDown = true;
				}
				else if(code == "Digit1") {
					if(inputDetection == true && zeroDown == false) {
						inputUpdate(code, carac);
					}
					oneDown = true;
				}
				else if(code == "ShiftLeft" || code == "ShiftRight") {
					shiftDown = true;
				}
				else if(code == "ControlLeft") { // ControlLeft
					ctrlDown = true;
				}
				else if(code == "AltRight" || (e.ctrlKey && e.altKey)) { // AltRight || AtlGr
					altDown = true;
				}
				else {
					if(inputDetection == true) {
						inputUpdate(code, carac);
					}
				}
				return false; // prevent default
			};

			document.onkeyup = function (e) {
				var code = e.code;
				if(code == qCode) {
					qDown = false;
					stateUpdate();
				}
				else if(code == pCode) {
					pDown = false;
					stateUpdate();
				}
				else if(code == "Digit0") {
					zeroDown = false;
				}
				else if(code == "Digit1") {
					oneDown = false;
				}
				else if(code == "ControlLeft") { // ControlLeft
					ctrlDown = false;
				}
				else if(code == "ShiftLeft" || code == "ShiftRight") {
					shiftDown = false;
				}
				else if(code == "AltRight" || (e.ctrlKey && e.altKey)) { // AltRight || AtlGr
					altDown = false;
				}
				return false; // prevent default
			};
		}

		function stopKeyDetection()
		{
			document.onkeydown = function (e) {};

			document.onkeyup = function (e) {};
		}

		function pauseKeyDetection() { inputDetection = false; }
		function resumeKeyDetection() { inputDetection = true; }


	/*  ----------------------------------------
		 INPUT UPDATE
		---------------------------------------- */


		function inputUpdate(code, carac)
		{
			if(carac == "Backspace" && currentInput.length > 0) {
				var caracToRemove = lastCaracCheck();
				//currentInput = currentInput.slice(0, caracToRemove);
				currentInput = currentInput.slice(0, cursorPosition - 1) + currentInput.slice(cursorPosition, currentInput.length);
				if(cursorPosition + caracToRemove > 0) {
					cursorPosition += caracToRemove;
				}
			}
			else if(carac == "Enter") {
				deleteCursor(document.getElementById("current-line"));
				submittedInput = true;
				cursorPosition = 0;
				return;
			}
			else if (carac == "ArrowUp") {
				if(inputHistIndex > 0 && inputHistIndex <= inputHist.length)
				{
					inputHistIndex--;
					currentInput = inputHist[inputHistIndex];
					cursorPosition = inputHist[inputHistIndex].length;
				}
			}
			else if (carac == "ArrowDown") {
				if(inputHistIndex >= 0 && inputHistIndex < inputHist.length - 1)
				{
					inputHistIndex++;
					currentInput = inputHist[inputHistIndex];
					cursorPosition = inputHist[inputHistIndex].length;
				}
			}
			else if (carac == "ArrowLeft") {
				moveCursor(-1);
			}
			else if (carac == "ArrowRight") {
				moveCursor(1);
			}
			else {
				let prevInputLength = currentInput.length;
				let displayedCarac = caracDisplay(code, carac);
				if(displayedCarac.length > 0)
				{
					//currentInput += caracDisplay(code, carac); // HERE
					currentInput = currentInput.substring(0, cursorPosition-1) + displayedCarac + currentInput.substring(cursorPosition, currentInput.length);
					inputHist[inputHist.length-1] = currentInput;
					//cursorPosition calculation
					if(cursorPosition < currentInput.length + 1) {
						cursorPosition++;
					}
					cursorPosition += currentInput.length - prevInputLength;
					if (cursorPosition > currentInput.length + 1) {
						cursorPosition = currentInput.length + 1;
					}
				}
			}


			// INPUT LAG
			setTimeout(function() { 
				// SECRET | NORMAL INPUT FORMATTING
				var displayInput = "";
				if(secretInput == true) {
					for(let i=0 ; i < currentInput.length ; i++) {
						displayInput += "*";
					}
				}
				else {
					displayInput = currentInput;
				}
				// PRINT + CURSOR POSITION
				document.getElementById("current-line").innerHTML = currentText + displayInput + " ";	
				moveCursor(0);	
			}, 70);
		}

			function deleteCursor(el)
			{
				for (let i=0; i < el.childNodes.length; i++) {
					if (el.childNodes[i].className == "cursor") {
						el.childNodes[i].outerHTML = el.childNodes[i].innerHTML;
					}
				}
			}

			function moveCursor(index)
			{
				let el = document.getElementById("current-line");
				// REMOVE PREVIOUS CURSOR
				deleteCursor(el);

				if (cursorPosition + index > 0 && cursorPosition + index <= currentInput.length + 1) {
					cursorPosition += index;
				}
				else {
					return;
				}

				let cursorPositionInLine = cursorPosition + currentText.length;
				//alert(cursorPositionInLine);
				// ADD NEXT CURSOR
				//if(index < 0) {
				el.innerHTML = el.innerHTML.substring(0,cursorPositionInLine-1) + "<span class='cursor'>" + el.innerHTML.substring(cursorPositionInLine-1, cursorPositionInLine) + "</span>" + el.innerHTML.substring(cursorPositionInLine, el.innerHTML.length);
				//}
			}

			function lastCaracCheck()
			{
				if(currentInput.endsWith("    ")) // nnbsp https://unicode-table.com/fr/202F/
					return -4;
				else
					return -1;
			}

			function caracDisplay(code, carac)
			{
				// Backspace case

				// ASCII CARAC

				if(isBepo == false) {
					if(carac.match(/^[a-zA-Z0-9!"#$%'()*+,-./:;=?@[\\\]_`\{|\}~&]$/g)) {
						return carac;
					}
				}
				else {
					return caracToBepo(code, carac);
				}

				switch(carac)
				{
					// SPECIALS
					case "<" :
						return "≺";
					case ">" :
						return "≻";
					case "Enter" :
						scrollToPageEnd();
						return "<br/>";
					case "Tab" :
						return "    ";
					case " " :
						return " "; // nnbsp https://unicode-table.com/fr/202F/
					default :
						return "";
				}
			}


	/*  ----------------------------------------
		 CARAC TO BEPO
		---------------------------------------- */

		function caracToBepo(code, carac) {
			switch(code)
			{
				case "KeyQ" :
					if (shiftDown == true) { return "B"; }
					else { return "b"; }
				case "KeyW" :
					if (shiftDown == true) { return "É"; }
					else { return "é"; }
				case "KeyE" :
					if (shiftDown == true) { return "P"; }
					else { return "p"; }
				case "KeyR" :
					if (shiftDown == true) { return "O"; }
					else { return "o"; }
				case "KeyT" :
					if (shiftDown == true) { return "È"; }
					else { return "è"; }
				case "KeyY" :
					if (shiftDown == true) { return "!"; }
					else { return "è"; }
				case "KeyU" :
					if (shiftDown == true) { return "V"; }
					else { return "v"; }
				case "KeyI" :
					if (shiftDown == true) { return "D"; }
					else { return "d"; }
				case "KeyO" :
					if (shiftDown == true) { return "L"; }
					else { return "l"; }
				case "KeyP" :
					if (shiftDown == true) { return "J"; }
					else { return "j"; }
				case "BracketLeft" :
					if (shiftDown == true) { return "Z"; }
					else { return "z"; }
				case "BracketRight" :
					if (shiftDown == true) { return "W"; }
					else { return "w"; }
				case "KeyA" :
					if (shiftDown == true) { return "A"; }
					else { return "a"; }
				case "KeyS" :
					if (shiftDown == true) { return "U"; }
					else { return "u"; }
				case "KeyD" :
					if (shiftDown == true) { return "I"; }
					else { return "i"; }
				case "KeyF" :
					if (shiftDown == true) { return "E"; }
					else { return "e"; }
				case "KeyG" :
					if (shiftDown == true) { return ";"; }
					else { return ","; }
				case "KeyH" :
					if (shiftDown == true) { return "C"; }
					else { return "c"; }
				case "KeyJ" :
					if (shiftDown == true) { return "T"; }
					else { return "t"; }
				case "KeyK" :
					if (shiftDown == true) { return "S"; }
					else { return "s"; }
				case "KeyL" :
					if (shiftDown == true) { return "R"; }
					else { return "r"; }
				case "Semicolon" :
					if (shiftDown == true) { return "N"; }
					else { return "n"; }
				case "Quote" :
					if (shiftDown == true) { return "M"; }
					else { return "m"; }
				case "Backslash" :
					if (shiftDown == true) { return "Ç"; }
					else { return "ç"; }
				case "IntlBackslash" :
					if (shiftDown == true) { return "Ê"; }
					else { return "ê"; }
				case "KeyZ" :
					if (shiftDown == true) { return "À"; }
					else { return "à"; }
				case "KeyX" :
					if (shiftDown == true) { return "Y"; }
					else { return "y"; }
				case "KeyC" :
					if (shiftDown == true) { return "X"; }
					else { return "x"; }
				case "KeyV" :
					if (shiftDown == true) { return ":"; }
					else { return "."; }
				case "KeyB" :
					if (shiftDown == true) { return "K"; }
					else { return "k"; }
				case "KeyN" :
					if (shiftDown == true) { return "?"; }
					else { return "'"; }
				case "KeyM" :
					if (shiftDown == true) { return "Q"; }
					else { return "q"; }
				case "Comma" :
					if (shiftDown == true) { return "G"; }
					else { return "g"; }
				case "Period" :
					if (shiftDown == true) { return "H"; }
					else { return "h"; }
				case "Slash" :
					if (shiftDown == true) { return "F"; }
					else { return "f"; }
				case "Backquote" :
					if (shiftDown == true) { return "#"; }
					else { return "$"; }
				case "Digit1" :
					if (shiftDown == true) { return "1"; }
					else { return '"'; }
				case "Digit2" :
					if (shiftDown == true) { return "2"; }
					else { return '«'; }
				case "Digit3" :
					if (shiftDown == true) { return "3"; }
					else { return '»'; }
				case "Digit4" :
					if (shiftDown == true) { return "4"; }
					else { return "("; }
				case "Digit5" :
					if (shiftDown == true) { return "5"; }
					else { return ")"; }
				case "Digit6" :
					if (shiftDown == true) { return "6"; }
					else { return "@"; }
				case "Digit7" :
					if (shiftDown == true) { return "7"; }
					else { return "+"; }
				case "Digit8" :
					if (shiftDown == true) { return "8"; }
					else { return "-"; }
				case "Digit9" :
					if (shiftDown == true) { return "9"; }
					else { return "/"; }
				case "Digit0" :
					if (shiftDown == true) { return "0"; }
					else { return "*"; }
				case "Minus" :
					if (shiftDown == true) { return "°"; }
					else { return "="; }
				case "Equal" :
					if (shiftDown == true) { return "`"; }
					else { return "%"; }
				case "Space" :
					if (shiftDown == true) { return " "; }
					else { return " "; }
				default :
					return "";
			}
		}

/*  =========================================================================
	 FULLSCREEN
	========================================================================= */

function scrollToPageEnd() {
	//window.scrollTo(0,document.body.scrollHeight);
	document.getElementsByTagName("main")[0].scrollTo(0,document.getElementsByTagName("main")[0].scrollHeight);
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}






/*  =========================================================================
	 COUNTDOWN
	========================================================================= */


function countdownUpdate()
{
	// VALUES UPDATE
	if(countdownSeconds > 0 && countdownRest == 0) {
		countdownSeconds--;
		countdownRest = 99;
	}
	else if(countdownSeconds > 0 || countdownRest > 0) {
		countdownRest--;
	}

	//DISPLAY
	var dispSeconds = countdownSeconds
	if(countdownSeconds < 10)
		dispSeconds = "0" + countdownSeconds;
	var dispRest = countdownRest
	if(countdownRest < 10)
		dispRest = "0" + countdownRest;


	document.getElementById("seconds").innerHTML = dispSeconds;
	document.getElementById("rest").innerHTML = dispRest;

	stateUpdate();
}


function stateUpdate()
{

	// Recommandation
	if(qDown == false && pDown == false) {
		document.getElementById("recommandation").innerHTML = " - press " + qName + " & " + pName;
	}
	else if(qDown == false) {
		document.getElementById("recommandation").innerHTML = " - press " + qName;
	}
	else if(pDown == false) {
		document.getElementById("recommandation").innerHTML = " - press " + pName;
	}
	else {
		document.getElementById("recommandation").innerHTML = "";
	}
}




function countdownStart()
{
	countdownUpdate();
	document.getElementById("countdown").classList.add("visible");
	countdown = setInterval(function(){ 
		if(countdownSeconds == 0 && countdownRest == 0) {
			clearInterval(countdown);
			stopKeyDetection();

			deleteCursor(document.getElementById("current-line"));
			cursorPosition = 0;

			newLine("Protocol 99 initiated<br/><br/>GAME OVER");
			setTimeout(function(){ 
				window.location.reload();
			}, 5000);
		}
		setTimeout(function(){ 
			if(qDown === false || pDown === false) {
				setTimeout(function(){ 
					countdownUpdate();
				}, 150);
			}
		}, 150);
	}, 10);
}

function countdownStop()
{
	clearInterval(countdown);
	qDown = false;
	pDown = false;
}

function countdownRefresh()
{
	countdownStop();
	countdownStart();
}










async function clearDisplay()
{
	//newLine("<br/><");
	let hWin = Math.ceil(window.innerHeight / 28); // 28px = font size
	let text = "";
	for(let i=0 ; i <= hWin ; i++) {
		text += "<br/>";
	}
	await newLine(text);
}




/*  =========================================================================
	 SCENARIO
	========================================================================= */




async function scenario()
{


	//var userLang = navigator.language || navigator.userLanguage; 
	//alert ("The language is: " + userLang);

	/*

	https://fr.wikipedia.org/wiki/QWERTZ
	https://gist.github.com/wpsmith/7604842

	*/

		/*  ---------------
			 STEP 0 : TITLE SCREEN
			--------------- */

	/*await newLine("" +
			"----------------------------------------<br/>" + 
			"&nbsp;&nbsp;<b>BOOM-KABOOM</b><br/>" + 
			"&nbsp;&nbsp;a <a href='https://arnaud.cool/'>games.arnaud.cool</a> production<br/>" + 
			"----------------------------------------<br/>");*/
	await newLine(text.gameTitle);	
	await newLine(text.gameRules);
	await newLine(text.wantToStartQuestion);
	await newInputLine(text.wantToStartAnswer);
	startKeyDetection();
	var startGame = setInterval(async function(){ 
		if(step == 0 && currentInput == text.wantToStartYes && submittedInput == true) {
			clearInterval(startGame);
			submittedInput = false;
			pauseKeyDetection();
			step++;
			goFullScreen();
			step1();
		}
		else if(step == 0 && currentInput == text.wantToStartNo && submittedInput == true) {
			clearInterval(startGame);
			submittedInput = false;
			pauseKeyDetection();
			await newLine("Bon, du coup je t'envoie glander sur JoliTube ;-)");
			setTimeout(function(){ 
				window.location.replace("https://jolitube.com");
			}, 2000);
		}
		else if(step == 0 && currentInput == "app" && submittedInput == true) { // TODO : delete
			clearInterval(startGame);
			submittedInput = false;
			pauseKeyDetection();
			displayApp();
		}
		else if(step == 0 && currentInput != text.wantToStartYes && currentInput != text.wantToStartNo && submittedInput == true) {
			submittedInput = false;
			await newLine("Je n'ai pas compris la réponse '" + currentInput + "'. Souhaitez-vous jouer ? [ start playing | no ]");
			await newInputLine("réponse : ");
		}
	}, 300);
}


async function step1()
{
	await newLine(	"Configuration détectée<br/>" +
					"&nbsp;&nbsp;Langue : " + language + "<br/>" +
					"&nbsp;&nbsp;Clavier : " + keyboardModel);
	await newLine("Est-ce la bonne configuration ? [ yes | settings ]");
	await newInputLine(text.wantToStartAnswer);
	resumeKeyDetection();
	var st1 = setInterval(async function(){ 
		if(step == 1 && currentInput == "yes" && submittedInput == true) {
			clearInterval(st1);
			submittedInput = false;
			pauseKeyDetection();
			await clearDisplay();
			step++;
			step2();
		}
		else if(step == 1 && currentInput == "settings" && submittedInput == true) {
			clearInterval(st1);
			submittedInput = false;
			pauseKeyDetection();
			step = 1.1;
			step1_1();
		}
		else if(step == 1 && currentInput != "yes" && currentInput != "settings" && submittedInput == true) {
			submittedInput = false;
			await newLine("Je n'ai pas compris la réponse '" + currentInput + "'. Est-ce la bonne configuration ? [ yes | settings ]");
			await newInputLine(text.wantToStartAnswer);
		}
	}, 300);
}

async function step1_1()
{
	await newLine("Language ? [ en | fr ]");
	await newInputLine("answer : ");
	resumeKeyDetection();
	var st1_1 = setInterval(async function(){ 
		if(step == 1.1 && (currentInput == "en" || currentInput == "fr") && submittedInput == true) {
			clearInterval(st1_1);
			submittedInput = false;
			pauseKeyDetection();
			step = 1.2;
			if(currentInput == "en") {
				language = "English";
			}
			else if(currentInput == "fr") {
				language = "Français";
			}
			step1_2();
		}
		else if(step == 1.1 && currentInput != "yes" && currentInput != "settings" && submittedInput == true) {
			submittedInput = false;
			await newLine("Invalid answer '" + currentInput + "'. Language ? [ en | fr ]");
			await newInputLine("answer : ");
		}
	}, 300);
}

async function step1_2()
{
	await newLine("Clavier ? [ qwerty | azerty | qwertz ]"); // TODO : language pack
	await newInputLine("answer : ");
	resumeKeyDetection();
	var st1_2 = setInterval(async function(){ 
		if(step == 1.2 && (currentInput == "qwerty" || currentInput == "azerty" || currentInput == "qwertz") && submittedInput == true) {
			clearInterval(st1_2);
			submittedInput = false;
			pauseKeyDetection();
			step=2;
			if(currentInput == "qwerty") {
				keyboardModel = "QWERTY";
			}
			else if(currentInput == "azerty") {
				keyboardModel = "AZERTY";
			}
			else if(currentInput == "qwertz") {
				keyboardModel = "QWERTZ";
			}
			await newLine(	"Récapitulatif de la configuration<br/>" +
					"&nbsp;&nbsp;Langue : " + language + "<br/>" +
					"&nbsp;&nbsp;Clavier : " + keyboardModel);
			await clearDisplay();
			step2();
		}
		else if(step == 1.2 && currentInput != "qwerty" && currentInput != "azerty" && currentInput != "qwertz" && submittedInput == true) {
			submittedInput = false;
			await newLine("Invalid answer '" + currentInput + "'. Clavier ? [ qwerty | azerty | qwertz ]");
			await newInputLine("answer : ");
		}
	}, 300);
}

async function step2()
{
	await newInputLine("user : ");
	resumeKeyDetection();
	var st2 = setInterval(async function(){ 
		if(step == 2 && currentInput == "president" && submittedInput == true) {
			clearInterval(st2);
			submittedInput = false;
			pauseKeyDetection();
			isConnectingAsPresident = true;
			isConnectingAsRoot = false;
			step++;
			step3();
		}
		if(step == 2 && currentInput == "root" && submittedInput == true) {
			clearInterval(st2);
			submittedInput = false;
			pauseKeyDetection();
			isConnectingAsPresident = false;
			isConnectingAsRoot = true;
			step++;
			step3();
		}
		else if(step == 2 && submittedInput == true) {
			submittedInput = false;
			await newLine("Utilisateur '" + currentInput + "' inconnu.");
			await newInputLine("user : ");
		}
	}, 300);
}

async function step3()
{
	await newInputLine("pwd : ");
	startSecretInput();
	resumeKeyDetection();
	var st3 = setInterval(async function(){ 
		if(step == 3 && isConnectingAsPresident == true && currentInput == "0000" && submittedInput == true) {
			clearInterval(st3);
			submittedInput = false;
			pauseKeyDetection();
			step++;
			stopSecretInput();
			isPresident = true;
			isRoot = false;
			isConnectingAsPresident = false;
			await newLine(	"Bienvenue Monsieur le Président,<br/>" +
							"ASTUCE : Au besoin, vous référer à l'aide intégrée : [ help ]");
			step4();
		}
		else if(step == 3 && isConnectingAsRoot == true && currentInput == "0000" && submittedInput == true) { // TODO : "QzEfb0n6@,56.apw/z"
			clearInterval(st3);
			submittedInput = false;
			pauseKeyDetection();
			step++;
			stopSecretInput();
			isPresident = false;
			isRoot = true;
			isConnectingAsRoot = false;
			bepoOn();
			await newLine(	"Bienvenue Monsieur l'Administrateur Système,<br/>" +
							"ASTUCE : Au besoin, vous référer à l'aide intégrée : [ help ]");
			step4();
		}
		else if(step == 3 && submittedInput == true) {
			submittedInput = false;
			step--;
			pauseKeyDetection();
			await newLine("Mauvais mot de passe");
			stopSecretInput();
			step2();
		}
	}, 300);
}

async function step4()
{
	if(isPresident) {
		await newInputLine("president@elysee % ");
	}
	else if(isRoot) {
		await newInputLine("root@elysee % ");
	}

	resumeKeyDetection();
	var st4 = setInterval(async function(){ 
		console.log("shift:" + shiftDown + ", ctrl:" + ctrlDown + ", alt" + altDown + ", 0:" + zeroDown + ", 1:" + oneDown);
		if(step == 4 && currentInput == "help" && submittedInput == true) {
			clearInterval(st4);
			submittedInput = false;
			pauseKeyDetection();
			await newLine("help");
			//step++;
			step4();
		}
		else if(step == 4 && currentInput.match(/^protocol.\d{1,20}.engage$/g) && submittedInput == true) {
			//alert("ok");
			clearInterval(st4);
			submittedInput = false;
			pauseKeyDetection();


			// PROTOCOL MATCH
			let parsedInput = currentInput.split(' '); // " " -> nnbsp https://unicode-table.com/fr/202F/
			if( parsedInput[1] == "99" && protocol99 == false) {
				step++;
				step5();
			}
			else if( parsedInput[1] == "99" && protocol99 == true) {
				await newLine("Le protocole 99 est déjà engagé.");
				step4();
			}
			else {
				await newLine("unknown protocol");
				step4();
			}
		}
		else if(step == 4 && currentInput.match(/^protocol.\d{1,20}.disengage$/g) && submittedInput == true) {
			clearInterval(st4);
			submittedInput = false;
			pauseKeyDetection();

			let parsedInput = currentInput.split(' '); // " " -> nnbsp https://unicode-table.com/fr/202F/

			if(protocol99 == true && parsedInput[1] == "99") {
				if(isRoot == false) {
					await newLine("Vous n'avez pas un niveau de droits suffisant pour cette action.");
					step4();
				}
				else {
					await newLine("ERROR #1289 - Operation ID not found");
					step4();
				}
			}
			else {
				await newLine("Le protocol " + parsedInput[1] + " n'est pas engagé.");
				step4();
			}
		}
		else if(step == 4 && currentInput.match(/^keymap.\d{1,20}$/g) && submittedInput == true) {
			clearInterval(st4);
			submittedInput = false;
			pauseKeyDetection();

			let parsedInput = currentInput.split(' '); // " " -> nnbsp https://unicode-table.com/fr/202F/

			if(parsedInput[1] == "0") {
				await newLine("Clavier maintenant configuré en AZERTY");
				bepoOff();
			}
			else if(parsedInput[1] == "1") {
				await newLine("Clavier maintenant configuré en BÉPO");
				bepoOn();
			}
			else {
				await newLine("Le mapping clavier " + parsedInput[1] + " n'existe pas");
			}

			step4();
		}
		else if(step == 4 && ((currentInput == "sudo" && submittedInput == true) || (ctrlDown == true && altDown == true && shiftDown == true && oneDown == true))) {
			clearInterval(st4);
			submittedInput = false;
			pauseKeyDetection();

			deleteCursor(document.getElementById("current-line"));
			cursorPosition = 0;

			if(isPresident == true) {
				await newLine('Utilisateur "president" déconnecté');
				await newLine("user : root");
				//step++;
				isPresident = false;
				isConnectingAsPresident = false;
				isConnectingAsRoot = true;
				step=3;
				step3();
			}
			else {
				await newLine('Vous êtes déjà connecté en tant que "root"');
				//step++;
				step4();
			}
		}
		else if(step == 4 && ctrlDown == true && altDown == true && shiftDown == true && zeroDown == true) {
			clearInterval(st4);
			submittedInput = false;
			pauseKeyDetection();

			deleteCursor(document.getElementById("current-line"));
			cursorPosition = 0;

			if(isRoot == true) {
				await newLine('Utilisateur "root" déconnecté');
				await newLine("user : president");
				//step++;
				isPresident = false;
				isConnectingAsPresident = true;
				isConnectingAsRoot = false;
				step=3;
				step3();
			}
			else {
				await newLine('Vous êtes déjà connecté en tant que "president"');
				//step++;
				step4();
			}
		}
		else if(step == 4 && (currentInput == "logout" || currentInput == "exit") && submittedInput == true) {
			clearInterval(st4);
			submittedInput = false;
			pauseKeyDetection();
			await newLine('Utilisateur "president" déconnecté');
			//step++;
			isPresident = false;
			step=2;
			step2();
		}
		else if(step == 4 && currentInput.match(/^operations.{1,100}$/g).length > 0 & isRoot == true && submittedInput == true) {
			clearInterval(st4);
			submittedInput = false;
			pauseKeyDetection();

			deleteCursor(document.getElementById("current-line"));
			cursorPosition = 0;

			let parsedInput = currentInput.split(' '); // " " -> nnbsp https://unicode-table.com/fr/202F/

			if(parsedInput[1] == "interface") {
				step=6;
				step6();
			}
			else if(parsedInput[1] == "history") {
				await newLine("hist");
				bepoOn();
			}
			else {
				await newLine("Le mapping clavier " + parsedInput[1] + " n'existe pas");
			}

			step4();
		}
		else if(step == 4 && submittedInput == true) {
			clearInterval(st4);
			submittedInput = false;
			pauseKeyDetection();
			await newLine("lapocompris");
			//step++;
			step4();
		}
	}, 50);
}

async function step5()
{
	await newLine(	"----------------------------------------<br/>" +
					"&nbsp;&nbsp;ENGAGEMENT DE LA FORCE DE FRAPPE NUCLÉAIRE<br/>" +
					"----------------------------------------<br/><br/>" +
					"AVERTISSEMENT : TOUT ORDRE CONFIRMÉ NE PEUT PLUS ÊTRE ANNULÉ<br/><br/>" +
					'NOTE : Pour quitter l\'interface, saisir "exit"<br/><br/>' +
					"CRÉATION DE L'ORDRE #19452020");
	await newInputLine("longitude : ");
	resumeKeyDetection();
	var st5 = setInterval(async function(){ 
		if(step == 5 && currentInput.match(/^\d{1,3}[,.]\d{1,3}$/g) && submittedInput == true) {
			clearInterval(st5);
			submittedInput = false;
			pauseKeyDetection();
			step = 5.1;
			longitude = currentInput;
			step5_1();
		}
		else if(step == 5 && currentInput == "exit" && submittedInput == true) {
			clearInterval(st5);
			submittedInput = false;
			pauseKeyDetection();
			await newLine("PROTOCOLE 99 ABANDONNÉ");
			step--;
			step4();
		}
		else if(step == 5 && submittedInput == true) {
			clearInterval(st5);
			submittedInput = false;
			pauseKeyDetection();
			await newLine("lapocompris");
			//step++;
			step5();
		}
	}, 300);
}

async function step5_1()
{
	await newInputLine("latitude : ");
	resumeKeyDetection();
	var st5_1 = setInterval(async function(){ 
		if(step == 5.1 && currentInput.match(/^\d{1,3}[,.]\d{1,3}$/g) && submittedInput == true) {
			clearInterval(st5_1);
			submittedInput = false;
			pauseKeyDetection();
			latitude = currentInput;
			step = 5.2;
			step5_2();
		}
		else if(step == 5.1 && currentInput == "exit" && submittedInput == true) {
			clearInterval(st5_1);
			submittedInput = false;
			pauseKeyDetection();
			await newLine("PROTOCOLE 99 ABANDONNÉ");
			step=4;
			step4();
		}
		else if(step == 5.1 && submittedInput == true) {
			clearInterval(st5_1);
			submittedInput = false;
			pauseKeyDetection();
			await newLine("lapocompris");
			//step++;
			step5_1();
		}
	}, 300);
}

async function step5_2()
{
	await newLine('APPUYER SUR LES TOUCHES "' + qName + '" ET "' + pName + '" DU CLAVIER POUR CONFIRMER <b>DÉFINITIVEMENT</b> LA PROCÉDURE, PUIS RELACHER');
	await newLine('Pour annuler la procédure, saisir "exit"');

	await newInputLine("annulation ? ");
	resumeKeyDetection();
	var st5_2 = setInterval(async function(){ 
		if(step == 5.2 && qDown == true && pDown == true) {
			clearInterval(st5_2);
			submittedInput = false;
			pauseKeyDetection();

			deleteCursor(document.getElementById("current-line"));
			cursorPosition = 0;

			step = 5.3;
			step5_3();
		}
		else if(step == 5.2 && currentInput == "exit" && submittedInput == true) {
			clearInterval(st5_2);
			submittedInput = false;
			pauseKeyDetection();
			await newLine("PROTOCOLE 99 ABANDONNÉ");
			step=4;
			step4();
		}
		else if(step == 5.2 && submittedInput == true) {
			clearInterval(st5_2);
			submittedInput = false;
			pauseKeyDetection();
			await newLine("lapocompris");
			//step++;
			step5_2();
		}
	}, 300);
}


async function step5_3()
{
	await newLine('RELÂCHEZ "' + qName + '" ET "' + pName + '" POUR INITIER LE PROTOCOLE 99');

	await newInputLine("annulation ? ");
	resumeKeyDetection();
	var st5_3 = setInterval(async function(){ 
		if(step == 5.3 && qDown == false && pDown == false) {
			clearInterval(st5_3);
			submittedInput = false;
			pauseKeyDetection();

			protocol99 = true;

			deleteCursor(document.getElementById("current-line"));
			cursorPosition = 0;

			await newLine('PROTOCOLE 99 INITIÉ - LANCEMENT DANS 30 SECONDES');
			countdownStart();

			step = 4;
			step4();
		}
		else if(step == 5.3 && currentInput == "exit" && submittedInput == true) {
			clearInterval(st5_3);
			submittedInput = false;
			pauseKeyDetection();
			await newLine("PROTOCOLE 99 ABANDONNÉ");
			step=4;
			step4();
		}
		else if(step == 5.3 && submittedInput == true) {
			clearInterval(st5_3);
			submittedInput = false;
			pauseKeyDetection();
			await newLine("lapocompris");
			//step++;
			step5_3();
		}
	}, 300);
}

async function step6()
{
	displayApp();
}








function displayApp()
{
	document.getElementById("ui-container").classList.add("visible");
}

function hideApp(text)
{
	document.getElementById("ui-container").classList.remove("visible");
	if(text !== undefined) {
		newLine(text);
	}
	step=4;
	step4();
}





document.addEventListener('DOMContentLoaded', function(event)
{

	//document.getElementById("countdown").classList.add("visible");




	//startKeyDetection();

	


	// SCENARIO

	detectLanguage();
	scenario();


















/*

	// GAME OVER COUNTDOWN
	var countdown = setInterval(function(){ 
		if(countdownSeconds == 0 && countdownRest == 0) {
			clearInterval(countdown);
			stopKeyDetection();
			newLine("Protocol initiated");
		}
		setTimeout(function(){ 
			if(qDown === false || pDown === false) {
				setTimeout(function(){ 
					countdownUpdate();
				}, 150);
			}
		}, 150);
	}, 10);

*/


	

});