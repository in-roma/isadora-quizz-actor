// iz_input 1 "begin vote"
// iz_input 2 "end vote"
// iz_input 3 "reset"
// iz_input 4 "users"
// iz_input 5 "curr ID"
// iz_input 6 "curr mess"
// iz_input 7 "delim"
// iz_input 8 "opts"
// iz_input 9 "optsMode"
// iz_input 10 "solution"
// iz_input 11 "pointsValue"
// iz_input 12 "teamMode"
// iz_input 13 "numberTeam"
// iz_input 14 "delimTeam"
// iz_input 15 "delimRename"
// iz_input 15 "delimRename"
// iz_input 16 "team initialization"

// iz_output 1 "vote status"
// iz_output 2 "begin vote"
// iz_output 3 "end vote"
// iz_output 4 "reset"
// iz_output 5 "users"
// iz_output 6 "votes cast"
// iz_output 7 "votes left"
// iz_output 8 "# opts"
// iz_output 9 "# opts-Mode"
// iz_input 10 "team initialized"
// iz_output 11 "users Scores"
// iz_output 12 "teamsComposition"
// iz_output 13 "teamsName"
// iz_output 14 "teamsScores"
// iz_output 15 "JSON teamsScores"
// iz_output 16 "JSON roundScores"

// Utilities variables
var initialization = 0;
var usersRoundHaveReplied = [];
var roundSolutions = [];
var usersScoresBoard = [];
var points = 10; // default value if points are not set
var orderResult = 0;
var display;
var lettersConverterValue = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
var teamMode = 0;
var delimTeam = '';
var delimRename = '';
var roundStarted = 0;
var teamInitialized = 0;

// Output variables
var voteStatus = 0;
var endVote = 0;
var reset = 0;
var voteCast = 0;
var voteLeft = 0;
var delimString = '';
var optsMode;
var teamsPlayers = [];
var teamsNames = [];
var teamsScores = [];
var answerstranslated = [];

function main(arguments) {
	// Set up
	var beginVote = 0;
	optsMode = arguments[8];
	opts = arguments[7];
	points = arguments[10];
	teamMode = arguments[11];
	teamNumbers = arguments[12];
	delimTeam = arguments[13];
	delimRename = arguments[14];
	delimString = arguments[6];
	initialization = arguments[15];

	// Set up team Mode
	if (teamMode === 1 && initialization) {
		teamsPlayers = Array.from({ length: arguments[12] }, (v, k) => []);
		teamsScores = Array.from({ length: arguments[12] }, (v, k) => 0);
		teamInitialized = 1;
		initialization = 0;
	}

	// Team mode user selecting his team
	var teamRegex = new RegExp(`^(${delimTeam})([1-9])$`, 'i');

	if (teamMode && delimTeam.length > 0 && teamRegex.test(arguments[5])) {
		var teamNumberSelected = arguments[5].replace(teamRegex, '$2');
		console.log('this is teamNumberSelected', teamNumberSelected);
		teamNumInt = parseInt(teamNumberSelected) - 1;
		if (
			teamsPlayers.every((team) =>
				team.every((user) => user !== arguments[4])
			)
		) {
			teamsPlayers[teamNumInt].push(arguments[4]);
		}
		console.log('this is teamsPlayers:', teamsPlayers);
	}

	// Team mode user changing team name (name is under 20 characters - to change modify the range {1,20} within next line)
	var renameRegex = new RegExp(`^(${delimRename})\s?(.{1,20})`, 'i');
	if (teamMode && delimRename.length > 0 && renameRegex.test(arguments[5])) {
		var teamNameSelected = arguments[5].replace(renameRegex, '$2');
		console.log('this is teamNameSelected', teamNameSelected);

		var teamUser =
			teamsPlayers.findIndex((team) => team.includes(arguments[4])) + 1;

		console.log('this is team User:', teamUser);
		if (teamUser) {
			var userFound = teamUser - 1;
			console.log('userFound:', userFound);
			teamsNames[userFound] = teamNameSelected;
		}
		console.log('this is teamsNames:', teamsNames);
	}
	// Begin vote - Start round
	if (arguments[0]) {
		voteStatus = 1;
		beginVote = 0;
		endVote = 0;
		voteLeft = arguments[3];
		voteCast = 0;
		roundStarted = 1;
		answerstranslated = [];
		roundSolutions = [];
	}

	// Cleaning values
	var answer = arguments[5].toLowerCase();
	var solution = arguments[9].toLowerCase();

	// Removing delim from answer
	var delimStringLength = delimString.length;
	var delimRegex = new RegExp(`^${delimString}.+`, 'i');
	console.log('delimStringLength:', delimStringLength);
	console.log('delimRegex.test(answer):', delimRegex.test(answer));

	if (delimStringLength > 0 && delimRegex.test(answer)) {
		var answerWithoutDelim = answer
			.split('')
			.slice(delimStringLength)
			.join('');
		answer = answerWithoutDelim;
		console.log('Answer with delim slice done:', answer);
	}

	console.log('this anwser state before opts process', answer);

	if (optsMode === 3) {
		if (!parseInt(answer)) {
			var convertedAnswer =
				lettersConverterValue.findIndex((el) => el === answer) + 1;
			answer = parseInt(convertedAnswer);
		}
		if (!parseInt(solution)) {
			var convertedSolution =
				lettersConverterValue.findIndex((el) => el === solution) + 1;
			solution = parseInt(convertedSolution);
		}
		if (typeof answer === 'string') {
			answer = parseInt(answer);
		}
		if (typeof solution === 'string') {
			solution = parseInt(solution);
		}
	}
	// User response validation according to : opts, optsMode & user answer
	function validation(opts, answer, optsMode) {
		if (optsMode === 3 || optsMode === 2) {
			var answerLitteralMode1 = new RegExp(`[1-${opts}]$`, 'i');

			return answerLitteralMode1.test(answer);
		}
		if (optsMode === 1) {
			optsConverted = lettersConverterValue[opts - 1];
			var answerLitteralMode2 = new RegExp(`[a-${optsConverted}]$`, 'i');

			return answerLitteralMode2.test(answer);
		}
	}

	console.log('this anwser state before scoring process', answer);
	// Storing users answers
	if (
		voteStatus &&
		roundStarted &&
		!usersRoundHaveReplied.includes(arguments[4]) &&
		validation(opts, answer, optsMode) &&
		voteLeft > 0
	) {
		// Vote states
		voteLeft = voteLeft - 1;
		voteCast = voteCast + 1;
		orderResult = orderResult + 1;
		// Scoring logic
		usersRoundHaveReplied.push(arguments[4]);
		// Needs to compare raws results
		if (delimStringLength > 0) {
			var solutionWithDelim = delimString + solution;
			answer = arguments[5].toLowerCase();
			solution = solutionWithDelim.toLowerCase();
		}
		// Score
		var teamUserPlaying;
		var newScore;
		if (usersScoresBoard.some((user) => user[0] === arguments[4])) {
			// If already scored & result is correct
			console.log('this answer user never replied:', answer);
			console.log('this solution user never replied:', solution);
			if (answer === solution) {
				var indexUser = usersScoresBoard.findIndex(
					(user) => user[0] === arguments[4]
				);
				// Adding Player Score
				usersScoresBoard[indexUser][1] =
					usersScoresBoard[indexUser][1] + points;
				// Adding team score
				if (teamMode) {
					teamUserPlaying = teamsPlayers.findIndex((team) =>
						team.includes(arguments[4])
					);

					newScore = teamsScores[teamUserPlaying] + points;
					console.log('this is new score', newScore);
					teamsScores[teamUserPlaying] = newScore;
				}
			}
		} else {
			// If never scored & result is correct
			console.log('this answer user never scored:', answer);
			console.log('this solution user never scored:', solution);
			if (answer === solution) {
				// Adding Player Score
				usersScoresBoard.push([arguments[4], points]);
				// Adding team score
				if (teamMode) {
					teamUserPlaying = teamsPlayers.findIndex((team) =>
						team.includes(arguments[4])
					);

					newScore = teamsScores[teamUserPlaying] + points;
					console.log('this is new score', newScore);
					teamsScores[teamUserPlaying] = newScore;
				}
			}
		}
		if (answer !== solution) {
			usersScoresBoard.push([arguments[4], 0]);
		}
		roundSolutions.push([
			arguments[4],
			arguments[5].toLowerCase(),
			orderResult,
		]);
	}

	// End vote
	if (arguments[1]) {
		voteStatus = 0; // Set voteStatus to 0 (off)
		orderResult = 0; // User order of reply
		voteLeft = 0; // clear votes left
		voteCast = 0; // clear votes cast
		beginVote = 0; // Set beginVote to 0 (off)
		endVote = 1; // Set endVote to 1 (on)
		usersRoundHaveReplied = [];
		roundStarted = 0;
	}

	// Reset (stop quizz)
	if (arguments[2]) {
		initialization = 0;
		teamInitialized = 0;
		voteStatus = 0; // Set voteStatus to 0 (off)
		beginVote = 0; // Set beginVote to 0 (off)
		reset = 1; // Set reset to 1 (on)
		orderResult = 0; // User order of reply
		voteLeft = 0; // clear votes left
		voteCast = 0; // clear votes cast
		usersRoundHaveReplied = []; // clear userResponses
		roundSolutions = []; // clear roundSolutions
		usersScoresBoard = []; // Set scores to empty array
		teamsNames = [];
		teamsScores = [];
		teamsPlayers = [];
		roundStarted = 0;
	}

	// Results
	// Poll
	var pollListStringified;
	if ((optsMode === 1 || optsMode === 3) && endVote) {
		var repliesPoll1 = Array.from({ length: arguments[7] }, (v, k) => 0);
		var replierLettered = repliesPoll1.map(
			(el, index) => lettersConverterValue[index]
		);
		var pollList = [];
		replierLettered.forEach((element) => {
			pollList.push({
				index: element,
				users: [],
				votes: 0,
			});
		});
		pollList.forEach((element) => {
			roundSolutions.forEach((el) => {
				if (el[1] === element.index) {
					element.users.push(el[0]);
					element.votes = element.votes + 1;
				}
			});
		});
		pollListStringified = JSON.stringify(pollList);
	}

	if (optsMode === 2 && endVote) {
		var repliesPoll2 = Array.from(
			{ length: arguments[7] },
			(v, k) => k + 1
		);

		var pollList2 = [];
		repliesPoll2.forEach((element) => {
			pollList2.push({
				index: element,
				users: [],
				votes: 0,
			});
		});
		pollList2.forEach((element) => {
			roundSolutions.forEach((el) => {
				if (parseInt(el[1]) === element.index) {
					element.users.push(el[0]);
					element.votes = element.votes + 1;
				}
			});
		});
		pollListStringified = JSON.stringify(pollList2);
	}

	// Displays
	if (teamMode === 0) {
		display = [
			voteStatus, // return vote status state (0/1)
			arguments[0], // return begin vote state (0/1)
			endVote, // return end vote state (0/1)
			arguments[2], // return reset state (0/1)
			arguments[3], // return # of users (this just passes through from the input)
			voteCast, // return # of votes cast
			voteLeft, // return # of votes left to be cast
			arguments[7], // return # of voting options (this just passes through from the input)
			arguments[8], // return vote mode (this just passes through from the input)
			teamInitialized,
			usersScoresBoard,
			teamsPlayers,
			pollListStringified,
		];
	}
	if (teamMode === 1 && !teamInitialized) {
		display = [
			voteStatus, // return vote status state (0/1)
			arguments[0], // return begin vote state (0/1)
			endVote, // return end vote state (0/1)
			arguments[2], // return reset state (0/1)
			arguments[3], // return # of users (this just passes through from the input)
			voteCast, // return # of votes cast
			voteLeft, // return # of votes left to be cast
			arguments[7], // return # of voting options (this just passes through from the input)
			arguments[8], // return vote mode (this just passes through from the input)
			teamInitialized,
			usersScoresBoard,
			teamsPlayers,
			teamsNames,
			teamsScores,
		];
	}
	if (teamMode === 1 && teamInitialized) {
		display = [
			voteStatus, // return vote status state (0/1)
			arguments[0], // return begin vote state (0/1)
			endVote, // return end vote state (0/1)
			arguments[2], // return reset state (0/1)
			arguments[3], // return # of users (this just passes through from the input)
			voteCast, // return # of votes cast
			voteLeft, // return # of votes left to be cast
			arguments[7], // return # of voting options (this just passes through from the input)
			arguments[8], // return vote mode (this just passes through from the input)
			teamInitialized,
			usersScoresBoard,
			teamsPlayers,
			teamsNames,
			teamsScores,
			pollListStringified,
		];
	}
	console.log('this is usersRoundHaveReplied:', usersRoundHaveReplied);
	console.log('this is roundSolutions:', roundSolutions);
	console.log('this is usersScoresBoard:', usersScoresBoard);

	return display;
}

main([
	0, //0beginVote
	0, //1endVote
	0, //2reset
	2, //3users
	'', //4currID
	'', //5currMess
	'', //6delim
	2, //7opts
	1, //8optsMode
	'', //9solution
	50, //10points
	1, //11teamMode
	2, //12teamNumbers
	'team', //13delimTeam
	'rename', //14delimRename
	0, //15teaminitialization
]);
//INPUT [ 0beginVote, 1endVote, 2reset, 3users, 4currID, 5currMess, 6delim, 7opts
//8optsMode, 9solution, 10points, 11teamMode, 12teamNumbers, 13delimTeam, 14delimRename, 15teaminitialization
