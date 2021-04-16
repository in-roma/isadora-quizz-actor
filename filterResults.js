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
// iz_input 11 "voteMode"

// iz_output 1 "vote status"
// iz_output 2 "begin vote"
// iz_output 3 "end vote"
// iz_output 4 "reset"
// iz_output 5 "users"
// iz_output 6 "votes cast"
// iz_output 7 "votes left"
// iz_output 8 "# opts"
// iz_output 9 "results"

// Utilities variables
var usersResponses = [];
var roundSolutions = [];
var usersScoresBoard = [];
var points = 10; // default value if points are not set
var orderResult = 0;
var display;
var lettersConverterValue = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
var questionNumber = 0;

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

function main(arguments) {
	// Set up
	optsMode = arguments[8];
	opts = arguments[7];
	points = arguments[10];

	// Start vote - Sequence Initialization
	if (arguments[0]) {
		voteStatus = 1;
		voteLeft = arguments[3];
	}

	// Cleaning values
	var answer = arguments[5].toLowerCase();
	var solution = arguments[9].toLowerCase();
	delimString = arguments[6].toLowerCase();

	// Removing delim from answer
	var delimStringLength = delimString.length;
	var delimRegex = new RegExp(`^${delimString}.?`, 'i');

	console.log('this is delimStringLength', delimStringLength);
	if (delimStringLength > 0 && delimRegex.test(answer)) {
		var pureAnswer = answer.split('').slice(delimStringLength).join('');
		answer = pureAnswer;
		console.log('this is pure answer without delim', pureAnswer);
	}

	if (optsMode === 3) {
		if (!parseInt(answer)) {
			var convertedAnswer =
				lettersConverterValue.findIndex((el) => el === answer) + 1;
			answer = parseInt(convertedAnswer);
			console.log('this is answer converted:', answer);
		}
		if (!parseInt(solution)) {
			var convertedSolution =
				lettersConverterValue.findIndex((el) => el === solution) + 1;
			solution = parseInt(convertedSolution);
			console.log('this is solution converted:', solution);
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
			console.log(
				'validation optmode 2 & 3',
				answerLitteralMode1.test(answer)
			);
			return answerLitteralMode1.test(answer);
		}
		if (optsMode === 1) {
			optsConverted = lettersConverterValue[opts - 1];
			var answerLitteralMode2 = new RegExp(`[a-${optsConverted}]$`, 'i');
			console.log(
				'validation optmode 1',
				answerLitteralMode2.test(answer)
			);
			return answerLitteralMode2.test(answer);
		}
	}

	// Storing users answers
	if (
		voteStatus &&
		beginVote &&
		!usersResponses.includes(arguments[4]) &&
		validation(opts, answer, optsMode)
	) {
		// Vote states
		voteLeft = voteLeft - 1;
		voteCast = voteCast + 1;
		orderResult = orderResult + 1;
		// Scoring logic
		usersResponses.push(arguments[4]);

		// Score
		if (usersScoresBoard.some((user) => user[0] === arguments[4])) {
			console.log('this userID is part of the user score board');
			// If already scored & result is correct
			console.log('this is answer compared', answer);
			console.log('this is solution compared', solution);
			if (answer === solution && orderResult <= arguments[3]) {
				console.log(
					'this is answer & solution in already score:',
					answer,
					solution
				);
				var indexUser = usersScoresBoard.findIndex(
					(user) => user[0] === arguments[4]
				);
				console.log('this is indexuser found:', indexUser);
				usersScoresBoard[indexUser][1] =
					usersScoresBoard[indexUser][1] + points;
				console.log(
					'this is user score board user array:',
					usersScoresBoard[indexUser]
				);
			}
		} else {
			// If never scored & result is correct
			console.log('this userID is not part of the userscore board');
			console.log('this is answer compared', answer);
			console.log('this is solution compared', solution);
			if (answer === solution && orderResult <= arguments[3]) {
				console.log(
					'this is  answer & solution in neverscore mode:',
					answer,
					solution
				);
				usersScoresBoard.push([arguments[4], points]);
			} else {
				// If never scored & result is not correct
				usersScoresBoard.push([arguments[4], 0]);
			}
		}
		results.push(arguments[5]);
		roundSolutions.push([arguments[4], arguments[5], orderResult]);

		// Reset if all users have replied
		if (voteLeft === 0) {
			orderResult = 0;
			voteLeft = arguments[3];
			usersResponses = []; // clear userResponses
			roundSolutions = []; // clear roundSolutions
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
		results = []; // clear results
		jsonOutputStringified = []; // clear jsonOutputStringified
	}

	// Results
	var jsonOutput = {
		usersScoresBoard, // voting results, i.e. a tally of how many votes each option has
		roundSolutions, // list of users that have cast valid votes and what they voted for
	};
	var jsonOutputStringified = JSON.stringify(jsonOutput);

	display = [
		voteStatus, // return vote status state (0/1)
		beginVote, // return begin vote state (0/1)
		endVote, // return end vote state (0/1)
		arguments[2], // return reset state (0/1)
		arguments[3], // return # of users (this just passes through from the input)
		voteCast, // return # of votes cast
		voteLeft, // return # of votes left to be cast
		arguments[7], // return # of voting options (this just passes through from the input)
		arguments[8], // return vote mode (this just passes through from the input)
		jsonOutputStringified, // return results JSON string (to be hooked up to a JSON Parser actor)
	];
	// console.log(usersScoresBoard);

	return display;
}

main([1, 0, 0, 2, 'userID4', 'A', '', 2, 1, 'A', 50]);
//INPUT [ 0beginVote, 1endVote, 2reset, 3users, 4currID, 5currMess, 6delim, 7opts, 8optsMode, 9solution, 10points ]
