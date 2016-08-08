(function() {
  'use strict';

  // Hangman
  var hangman = {

    wins : 0,
    losses : 0,
    wordList : [],

    start : function() {

      this.word = '';
      this.wordInProgress = [];
      this.userGuess = '';
      this.alreadyGuessed = [];
      this.chances = 10;

      if(this.wordList.length < 1)
        this.getList();

    },

    getList : function(generateWord) {

      var xhr = new XMLHttpRequest();

      xhr.open('GET', 'assets/words.txt', true);
      xhr.onreadystatechange = function() {

        if(xhr.readyState === 4 ) {

          hangman.wordList = xhr.responseText.split(/\s+/);
          hangman.generateWord();

        }

      };

      xhr.send();

    },

    generateWord : function() {

      // Generate a random index
      var rand = Math.floor(Math.random()*this.wordList.length);
      this.word = this.wordList[rand];
      console.log(this.word);

      // Create HTML skeleton
      this.createHTML();

    },

    createHTML : function() {

      var ulWord = document.getElementById('hangman-word');
      var ulGuessed = document.getElementById('hangman-guessed');
      var divChances = document.getElementById('hangman-chances');

      ulWord.innerHTML = '';
      ulGuessed.innerHTML = '';
      divChances.innerHTML = this.chances;

      for(var i=0; i < this.word.length; i++) {

        var li = document.createElement("LI");
        ulWord.appendChild(li);

      }
    },

    checkBadInput : function(keyInput) {

      // Check keycodes a-z
      if(keyInput >= 65 && keyInput <= 90) {

        this.userGuess = String.fromCharCode(keyInput).toLowerCase();
        return false;

      } else {

        alert('That\'s not a letter!');
        return true;

      }

    },

    checkIfGuessed : function() {

      if(this.alreadyGuessed.indexOf(this.userGuess) !== -1) {

        alert('You\'ve already guessed that letter!');
        return true;

      } else {

        this.alreadyGuessed.push(this.userGuess);
        return false;

      }

    },

    checkInWord: function() {

      var oldWordLength = this.wordInProgress.length;

      for(var i=0; i < this.word.length; i++) {

        if(this.userGuess === this.word[i]) {

          this.wordInProgress.push(this.userGuess);
          this.addLetterHTML(i);

        }
      }

      console.log(this.wordInProgress.length, this.word.length);

      if(this.wordInProgress.length === this.word.length) {

        // Trigger win
        alert('You win! The word was '+this.word+'!');

      } else if(this.wordInProgress.length > oldWordLength) {

        console.log(this.wordInProgress);
        // Play sound

      } else {

        // Remove guess chance
        this.removeChance();

      }

      this.addGuessedHTML();

    },

    addLetterHTML : function(index) {

      var li = document.getElementById('hangman-word').childNodes[index];

      li.innerHTML = this.userGuess;

    },

    addGuessedHTML : function() {

      var ul = document.getElementById('hangman-guessed');
      var li = document.createElement("LI");
      var text = document.createTextNode(this.userGuess);

      li.appendChild(text);
      ul.appendChild(li);

    },

    removeChance : function() {

      this.chances--;

      if(this.chances < 1) {

        // Trigger loss

      }

      var div = document.getElementById("hangman-chances");
      div.innerHTML = this.chances;

    },


  };

  // Create object properties
  hangman.start();

  // Key press event
  document.onkeyup = function(event){

    // Check if input is not an alphabetic character
    if(hangman.checkBadInput(event.keyCode))
      return;

    // Check if user already tried that letter
    if(hangman.checkIfGuessed())
      return;

    // Check if letter is in the word
    hangman.checkInWord();

  };

  // Event listeners
  document.getElementById('hangman-generate').addEventListener('click', function(event) {

    event.preventDefault();
    hangman.generateWord();

  });

})();
