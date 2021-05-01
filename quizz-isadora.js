// Utilities variables
var lettersConverterValue = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
var points = 10; // default value if points are not set
var usersRoundHaveReplied = [];
var roundSolutions = [];
var usersScoresBoard = [];
var orderResult = 0;
var teamMode = 0;
var delimTeam = '';
var delimRename = '';
var roundStarted = 0;
var teamInitialized = 0;
var display;

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
var teamModeOnlyOneReply = [];
var answerstranslated = [];
var individualScoresList = {};
var teamsScoresList = {};
var playersList = {};
var teamList = {};
var pollList = {};
var pollList2 = {};

function main(arguments) {
	// Set up
	var beginVote = 0;
	var answer = arguments[5].toLowerCase();
	delimString = arguments[6];
	var opts = arguments[7];
	var solution = arguments[9].toLowerCase();
	points = arguments[10];
	teamMode = arguments[11];
	delimTeam = arguments[13];
	delimRename = arguments[14];
	optsMode = arguments[8];
	var initialization = arguments[15];
	var answerWithoutDelim;

	// Team Mode initialization
	if ((teamMode === 1 || teamMode === 2) && initialization) {
		teamsPlayers = Array.from({ length: arguments[12] }, (v, k) => []);
		teamsScores = Array.from({ length: arguments[12] }, (v, k) => 0);
		teamModeOnlyOneReply = Array.from(
			{ length: arguments[12] },
			(v, k) => 0
		);
		teamInitialized = 1;
		initialization = 0;
	}
	if (teamMode === 2 && arguments[0] === 1) {
		teamModeOnlyOneReply = [];
		teamModeOnlyOneReply = Array.from(
			{ length: arguments[12] },
			(v, k) => 0
		);
	}
	// Team mode user selecting his team
	var teamRegex = new RegExp(`^(${delimTeam})\s?([1-9])`, 'i');
	var teamNumInt;
	if (
		(teamMode === 1 || teamMode === 2) &&
		delimTeam.length > 0 &&
		teamRegex.test(arguments[5])
	) {
		var teamNumberSelected = arguments[5].replace(teamRegex, '$2');
		teamNumInt = parseInt(teamNumberSelected) - 1;
		if (
			teamsPlayers.every((team) =>
				team.every((user) => user !== arguments[4])
			)
		) {
			teamsPlayers[teamNumInt].push(arguments[4]);
		}
	}

	// Team mode user changing team name (name is under 24 characters)
	var renameRegex = new RegExp(`^(${delimRename})\s*(.{1,24})`, 'i');
	if (
		(teamMode === 1 || teamMode === 2) &&
		delimRename.length > 0 &&
		renameRegex.test(arguments[5])
	) {
		var teamNameSelected = arguments[5].replace(renameRegex, '$2').trim();

		var teamUser =
			teamsPlayers.findIndex((team) => team.includes(arguments[4])) + 1;

		if (teamUser) {
			var userFound = teamUser - 1;
			teamsNames[userFound] = teamNameSelected;
		}
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
		individualScoresList = {};
		teamsScoresList = {};
		pollList = {};
		pollList2 = {};
	}

	// Removing delim from answer
	var delimStringLength = delimString.length;
	var delimRegex = new RegExp(`^(?:${delimString})`, 'i');
	var stateDelim = delimRegex.test(arguments[5]);

	if (delimStringLength > 0 && delimRegex.test(arguments[5])) {
		answerWithoutDelim = answer.split('').slice(delimStringLength).join('');
		answer = answerWithoutDelim;
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
		var answerLitteralMode1;
		var answerLitteralMode2;
		var validation = false;
		var optsConverted;
		if (delimStringLength > 0) {
			if ((optsMode === 3 || optsMode === 2) && stateDelim) {
				answerLitteralMode1 = new RegExp(`[1-${opts}]$`, 'i');

				validation = answerLitteralMode1.test(answer);
			}
			if (optsMode === 1 && stateDelim) {
				optsConverted = lettersConverterValue[opts - 1];
				answerLitteralMode2 = new RegExp(`[a-${optsConverted}]$`, 'i');

				validation = answerLitteralMode2.test(answer);
			}
		}
		if (delimStringLength === 0) {
			if (optsMode === 3 || optsMode === 2) {
				answerLitteralMode1 = new RegExp(`[1-${opts}]$`, 'i');

				validation = answerLitteralMode1.test(answer);
			}
			if (optsMode === 1) {
				optsConverted = lettersConverterValue[opts - 1];
				answerLitteralMode2 = new RegExp(`[a-${optsConverted}]$`, 'i');

				validation = answerLitteralMode2.test(answer);
			}
		}
		return validation;
	}

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
				teamUserPlaying = teamsPlayers.findIndex((team) =>
					team.includes(arguments[4])
				);
				if (teamMode === 1) {
					newScore = teamsScores[teamUserPlaying] + points;
					teamsScores[teamUserPlaying] = newScore;
				}
				if (teamMode === 2) {
					if (teamModeOnlyOneReply[teamUserPlaying] === 0) {
						newScore = teamsScores[teamUserPlaying] + points;
						teamsScores[teamUserPlaying] = newScore;

						teamModeOnlyOneReply[teamUserPlaying] = 1;
					}
				}
			}
			// If already scored & result is not correct
			if (answer !== solution) {
				if (teamMode === 2) {
					teamUserPlaying = teamsPlayers.findIndex((team) =>
						team.includes(arguments[4])
					);

					teamModeOnlyOneReply[teamUserPlaying] = 1;
				}
			}
		} else {
			// If never scored & result is correct
			if (answer === solution) {
				// Adding Player Score
				usersScoresBoard.push([arguments[4], points]);
				// Adding team score
				teamUserPlaying = teamsPlayers.findIndex((team) =>
					team.includes(arguments[4])
				);
				if (teamMode === 1) {
					newScore = teamsScores[teamUserPlaying] + points;
					teamsScores[teamUserPlaying] = newScore;
				}
				if (teamMode === 2) {
					if (teamModeOnlyOneReply[teamUserPlaying] === 0) {
						newScore = teamsScores[teamUserPlaying] + points;
						teamsScores[teamUserPlaying] = newScore;
						teamModeOnlyOneReply[teamUserPlaying] = 1;
					}
				}
			}
			// If never scored & result is not correct
			if (answer !== solution) {
				if (teamMode === 2) {
					teamUserPlaying = teamsPlayers.findIndex((team) =>
						team.includes(arguments[4])
					);

					teamModeOnlyOneReply[teamUserPlaying] = 1;
				}
				usersScoresBoard.push([arguments[4], 0]);
			}
		}
		if (delimStringLength > 0) {
			roundSolutions.push([
				arguments[4],
				answerWithoutDelim.toLowerCase(),
				orderResult,
			]);
		} else {
			roundSolutions.push([arguments[4], answer, orderResult]);
		}
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
	var pollListStringified;
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
		individualScoresList = {};
		teamsScoresList = {};
		teamList = {};
		playersList = {};
		pollList = {};
		pollList2 = {};
		pollListStringified = {};
		individualScoresListStringified = {};
		teamsPlayersListStringified = {};
		teamListStringified = {};
		teamsScoresListStringified = {};
	}

	// Results

	// Poll
	if (optsMode === 1 || optsMode === 3) {
		var repliesPoll1 = Array.from({ length: arguments[7] }, (v, k) => 0);
		var replierLettered = repliesPoll1.map(
			(el, index) => lettersConverterValue[index]
		);

		replierLettered.forEach((element) => {
			pollList[element] = 0;
		});
		if (roundSolutions.length > 0) {
			roundSolutions.forEach((el) => {
				Object.entries(pollList).forEach((entry) => {
					var [key, value] = entry;
					if (el[1] === key) {
						pollList[key] = value + 1;
					}
				});
			});
		}
		pollListStringified = JSON.stringify(pollList);
	}

	if (optsMode === 2) {
		var repliesPoll2 = Array.from(
			{ length: arguments[7] },
			(v, k) => k + 1
		);

		repliesPoll2.forEach((element) => {
			pollList2[element] = 0;
		});
		if (roundSolutions.length > 0) {
			roundSolutions.forEach((el) => {
				Object.entries(pollList2).forEach((entry) => {
					var [key, value] = entry;
					if (el[1] === key) {
						pollList2[key] = value + 1;
					}
				});
			});
		}
		pollListStringified = JSON.stringify(pollList2);
	}
	// Individual
	usersScoresBoard.forEach((el) => {
		individualScoresList[el[0]] = el[1];
	});

	// Players
	if ((teamMode === 1 || teamMode === 2) && teamInitialized) {
		teamsPlayers.forEach((element, index) => {
			playersList['T' + (index + 1)] = element.toString();
		});
	}
	// Team
	if ((teamMode === 1 || teamMode === 2) && teamInitialized) {
		teamsNames.forEach((element, index) => {
			teamList['T' + (index + 1)] = element.toString();
		});

		teamsScores.forEach((element, index) => {
			teamsScoresList[teamsNames[index]] = element;
		});
	}

	var individualScoresListStringified = JSON.stringify(individualScoresList);
	var teamsPlayersListStringified = JSON.stringify(playersList);
	var teamListStringified = JSON.stringify(teamList);
	var teamsScoresListStringified = JSON.stringify(teamsScoresList);

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
			teamsNames,
			teamsScores,
			pollListStringified,
			individualScoresListStringified,
		];
	}
	if (teamMode === 1 || teamMode === 2) {
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
			individualScoresListStringified,
			teamsPlayersListStringified,
			teamListStringified,
			teamsScoresListStringified,
		];
	}

	// console.log('this is usersRoundHaveReplied:', usersRoundHaveReplied);
	// console.log('this is roundSolutions:', roundSolutions);
	// console.log('this is usersScoresBoard:', usersScoresBoard);

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
	0, //11teamMode
	2, //12teamNumbers
	'team', //13delimTeam
	'rename', //14delimRename
	0, //15teaminitialization
]);
