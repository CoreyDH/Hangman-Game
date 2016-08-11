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
      this.chances = 11;

      this.animation.clear();

      if(this.wordList.length < 1) {
        this.getList();
      } else {
        hangman.generateWord();
      }

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
        var text = document.createTextNode('\u00A0');
        li.appendChild(text);
        ulWord.appendChild(li);

      }
    },

    checkBadInput : function(keyInput) {

      // Check keycodes a-z
      if(keyInput >= 65 && keyInput <= 90) {

        return false;

      } else {

        return true;

      }

    },

    checkIfGuessed : function() {

      if(this.alreadyGuessed.indexOf(this.userGuess) !== -1) {

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

      if(this.wordInProgress.length === this.word.length) {

        // Trigger win
        this.win();

      } else if(this.wordInProgress.length > oldWordLength) {


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
      this.animation.load();

      var div = document.getElementById("hangman-chances");
      div.innerHTML = this.chances;

      // Check if lost
      if(this.chances < 1)
        this.lose();
    },

    win : function() {
      alert('Congratulations! You win! The word was '+this.word+'!');
    },

    lose : function() {
      alert('Better luck next time! The word was '+this.word+'!');
    },

    animation: {
      load: function() {

        var parts = ['bottom', 'pillar', 'support', 'top', 'noose', 'head', 'torso', 'leftarm', 'rightarm', 'leftleg', 'rightleg'];
        var index = parts.length - hangman.chances - 1;

        document.getElementById('hangman-'+parts[index]).style.opacity = 1;

      },
      clear: function() {

        var divs = document.getElementById('hangman-platform').children;

        for(var i=0; i < divs.length; i++) {
          divs[i].style.opacity = 0;
        }

      }
    }
  };

  // Create object properties
  hangman.start();

  // Key press event
  document.onkeyup = function(event){

    // Check if input is not an alphabetic character
    if(hangman.checkBadInput(event.keyCode)) {
      alert('That\'s not a letter!');
      return;
    } else {
      hangman.userGuess = String.fromCharCode(event.keyCode).toLowerCase();
    }

    // Check if user already tried that letter
    if(hangman.checkIfGuessed()) {
      alert('You\'ve already guessed that letter!');
      return;
    }

    // Check if letter is in the word
    hangman.checkInWord();

  };

  // Event listeners
  document.getElementById('hangman-generate').addEventListener('click', function(event) {

    event.preventDefault();
    hangman.start();

  });

})();
