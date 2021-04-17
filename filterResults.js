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

// iz_output 1 "vote status"
// iz_output 2 "begin vote"
// iz_output 3 "end vote"
// iz_output 4 "reset"
// iz_output 5 "users"
// iz_output 6 "votes cast"
// iz_output 7 "votes left"
// iz_output 8 "# opts"
// iz_output 9 "# opts-Mode"
// iz_output 10 "users Scores"
// iz_output 11 "teamsComposition"
// iz_output 12 "teamsName"
// iz_output 13 "teamsScores"
// iz_output 14 "JSON teamsScores"
// iz_output 15 "JSON roundScores"

// Utilities variables
var usersResponses = [];
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

// Output variables
var voteStatus = 0;
var beginVote = 0;
var endVote = 0;
var reset = 0;
var voteCast = 0;
var voteLeft = 0;
var delimString = '';
var optsMode;
var results = [];
var teamsPlayers = [[], [], [], []];
var teamsNames = [];
var teamsScores = [0, 0, 0, 0];

function main(arguments) {
	// Set up
	optsMode = arguments[8];
	opts = arguments[7];
	points = arguments[10];
	teamMode = arguments[11];
	teamNumbers = arguments[12];
	delimTeam = arguments[13];
	delimRename = arguments[14];

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
	// Start vote - Sequence Initialization
	if (arguments[0]) {
		voteStatus = 1;
		beginVote = 0;
		endVote = 0;
		voteLeft = arguments[3];
		voteCast = 0;
		roundStarted = 1;
	}

	// Cleaning values
	var answer = arguments[5].toLowerCase();
	var solution = arguments[9].toLowerCase();
	delimString = arguments[6].toLowerCase();

	// Removing delim from answer
	var delimStringLength = delimString.length;
	var delimRegex = new RegExp(`^${delimString}.?`, 'i');

	if (delimStringLength > 0 && delimRegex.test(answer)) {
		var pureAnswer = answer.split('').slice(delimStringLength).join('');
		answer = pureAnswer;
	}

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

	// Storing users answers
	if (
		voteStatus &&
		roundStarted &&
		!usersResponses.includes(arguments[4]) &&
		validation(opts, answer, optsMode) &&
		voteLeft > 0
	) {
		// Vote states
		voteLeft = voteLeft - 1;
		voteCast = voteCast + 1;
		orderResult = orderResult + 1;
		// Scoring logic
		usersResponses.push(arguments[4]);

		// Score
		var teamUserPlaying;
		var newScore;
		if (usersScoresBoard.some((user) => user[0] === arguments[4])) {
			// If already scored & result is correct

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

			if (answer === solution) {
				// Adding Player Score
				usersScoresBoard.push([arguments[4], points]);
			}
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

		results.push(arguments[5]);
		roundSolutions.push([arguments[4], arguments[5], orderResult]);
		console.log('this is teamsScores:', teamsScores);

		// Reset if all users have replied
		// if (voteLeft === 0) {
		// 	orderResult = 0;
		// 	voteLeft = arguments[3];
		// 	usersResponses = [];
		// 	roundSolutions = [];
		// }
	}

	// End vote
	if (arguments[1]) {
		voteStatus = 0; // Set voteStatus to 0 (off)
		orderResult = 0; // User order of reply
		voteLeft = 0; // clear votes left
		voteCast = 0; // clear votes cast
		beginVote = 0; // Set beginVote to 0 (off)
		endVote = 1; // Set endVote to 1 (on)
		usersResponses = [];
		roundStarted = 0;
	}

	// Reset (stop quizz)
	if (arguments[2]) {
		voteStatus = 0; // Set voteStatus to 0 (off)
		beginVote = 0; // Set beginVote to 0 (off)
		reset = 1; // Set reset to 1 (on)
		orderResult = 0; // User order of reply
		voteLeft = 0; // clear votes left
		voteCast = 0; // clear votes cast
		usersResponses = []; // clear userResponses
		roundSolutions = []; // clear roundSolutions
		usersScoresBoard = []; // Set scores to empty array
		results = []; // clear resultsvar teamsPlayers = [[], [], [], []];
		teamsNames = [];
		teamsScores = [0, 0, 0, 0];
		teamsPlayers = [[], [], [], []];
		roundStarted = 0;
	}

	// Results
	var teamScoreDetails = [
		// {
		// 	name: teamsNames[0],
		// 	players: teamsPlayers[0],
		// 	score: teamsScores[0],
		// },
		// {
		// 	name: teamsNames[1],
		// 	players: teamsPlayers[1],
		// 	score: teamsScores[1],
		// },
		// {
		// 	name: teamsNames[2],
		// 	players: teamsPlayers[2],
		// 	score: teamsScores[2],
		// },
		// {
		// 	name: teamsNames[3],
		// 	players: teamsPlayers[3],
		// 	score: teamsScores[3],
		// },
	];
	var teamScoreDetailsStringified = JSON.stringify(teamScoreDetails);

	var answersView = [
		{
			correctAnswer: arguments[9],
		},
		{
			individualScores: usersScoresBoard,
		},

		// {
		// 	answer: roundSolution[0],
		// },
		// {
		// 	answer: roundSolution[1],
		// },
		// {
		// 	answer: roundSolution[2],
		// },
		// {
		// 	answer: roundSolution[3],
		// },
	];
	var answersViewStringified = JSON.stringify(answersView);

	// Displays
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
		usersScoresBoard,
		teamsPlayers,
		teamsNames,
		teamsScores,
		teamScoreDetailsStringified,
		answersViewStringified,
	];
	// console.log(usersScoresBoard);

	return display;
}

main([1, 0, 0, 2, 'userID4', 'A', '', 2, 1, 'A', 50, 1, 2, 'team', 'rename']);
//INPUT [ 0beginVote, 1endVote, 2reset, 3users, 4currID, 5currMess, 6delim, 7opts
//8optsMode, 9solution, 10points, 11teamMode, 12teamNumbers, 13delimTeam, 14delimRename
