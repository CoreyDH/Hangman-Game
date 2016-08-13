(function() {
    'use strict';

    // Hangman
    var hangman = {

        wins: 0,
        losses: 0,
        wordList: [],
        music: true,

        start: function() {

            this.word = '';
            this.wordInProgress = [];
            this.userGuess = '';
            this.alreadyGuessed = [];
            this.chances = parseInt(this.getSelectValue('chances-num'));
            this.wordLength = parseInt(this.getSelectValue('word-length'));
            this.difficulty = this.chances > 11 ? 'easy' : 'normal';

            this.animation.clear();

            if (this.wordList.length < 1) {
                this.getList();
            } else {
                this.generateWord();
            }

            this.keyOn();

        },

        getList: function() {

            var xhr = new XMLHttpRequest();

            xhr.open('GET', 'assets/words.txt', true);
            xhr.onreadystatechange = function() {

                if (xhr.readyState === 4) {

                    hangman.wordList = xhr.responseText.split(/\s+/);
                    hangman.generateWord();

                }

            };

            xhr.send();

        },

        generateWord: function() {

            if(this.wordLength > 0) {

              var acceptableWords = [];

              for(var i=0; i < this.wordList.length; i++) {

                if(this.wordList[i].length === this.wordLength) {
                  acceptableWords.push(this.wordList[i]);
                }

              }

              this.word = this.getRandom(acceptableWords);

            } else {

              this.word = this.getRandom(this.wordList);

            }

            console.log(this.word);

            // Create HTML skeleton
            this.createHTML();

        },

        createHTML: function() {

            var ulWord = document.getElementById('hangman-word');
            var ulGuessed = document.getElementById('hangman-guessed');
            var divChances = document.getElementById('hangman-chances');

            ulWord.innerHTML = '';
            ulGuessed.innerHTML = '';
            divChances.innerHTML = this.chances;

            for (var i = 0; i < this.word.length; i++) {

                var li = document.createElement("LI");
                var text = document.createTextNode('\u00A0');
                li.appendChild(text);
                ulWord.appendChild(li);

            }
        },

        getSelectValue: function(id) {

          var el = document.getElementById(id);
          return el.options[el.selectedIndex].value;

        },

        getRandom: function(arr) {

          var rand =  Math.floor(Math.random()*arr.length);
          return arr[rand];
        },

        checkBadInput: function(keyInput) {

            // Check keycodes a-z
            if (keyInput >= 65 && keyInput <= 90) {

                return false;

            } else {

                return true;

            }

        },

        checkIfGuessed: function() {

            if (this.alreadyGuessed.indexOf(this.userGuess) !== -1) {

                return true;

            } else {

                this.alreadyGuessed.push(this.userGuess);
                return false;

            }

        },

        checkInWord: function() {

            var oldWordLength = this.wordInProgress.length;

            for (var i = 0; i < this.word.length; i++) {

                if (this.userGuess === this.word[i]) {

                    this.wordInProgress.push(this.userGuess);
                    this.addLetterHTML(i);

                }
            }

            if (this.wordInProgress.length === this.word.length) {

                // Trigger win
                this.win();

            } else if (this.wordInProgress.length > oldWordLength) {


                // Play sound

            } else {

                // Remove guess chance
                this.removeChance();

                // Check if lost, trigger loss
                if (this.chances < 1)
                    this.lose();

            }

            this.addGuessedHTML();

        },

        addLetterHTML: function(index) {

            var li = document.getElementById('hangman-word').childNodes[index];

            li.innerHTML = this.userGuess;

        },

        addGuessedHTML: function() {

            var ul = document.getElementById('hangman-guessed');
            var li = document.createElement("LI");
            var text = document.createTextNode(this.userGuess);

            li.appendChild(text);
            ul.appendChild(li);

        },

        removeChance: function() {

            this.chances--;
            this.animation.load();

            var div = document.getElementById("hangman-chances");
            div.innerHTML = this.chances;

        },

        win: function() {

            this.wins++;
            document.getElementById('hangman-wins').innerHTML = this.wins;
            this.modal.html('<h1 class="text-center">YOU WIN</h1>');
        },

        lose: function() {

            this.losses++;
            document.getElementById('hangman-losses').innerHTML = this.losses;
            this.modal.html('<h1 class="text-center">YOU LOSE!</h1>');
        },

        keyOn: function() {

            // Key press event
            document.onkeyup = function(event) {

                // Check if input is not an alphabetic character
                if (hangman.checkBadInput(event.keyCode)) {
                    alert('That\'s not a letter!');
                    return;
                } else {
                    hangman.userGuess = String.fromCharCode(event.keyCode).toLowerCase();
                }

                // Check if user already tried that letter
                if (hangman.checkIfGuessed()) {
                    alert('You\'ve already guessed that letter!');
                    return;
                }

                // Check if letter is in the word
                hangman.checkInWord();

            };

        },

        keyOff: function() {
            document.onkeyup = '';
        },

        animation: {

            load: function() {

                var reverse;

                if(hangman.difficulty === 'easy' && hangman.chances % 2 !== 0){
                  return;

                } else if(hangman.difficulty === 'easy' && hangman.chances % 2 === 0) {
                  reverse = hangman.chances/2;

                } else {
                  reverse = hangman.chances;
                }

                var parts = ['bottom', 'pillar', 'support', 'top', 'noose', 'head', 'torso', 'leftarm', 'rightarm', 'leftleg', 'rightleg'];
                var index = parts.length - reverse - 1;

                document.getElementById('hangman-' + parts[index]).style.opacity = 1;

            },
            clear: function() {

                var divs = document.getElementById('hangman-platform').children;

                for (var i = 0; i < divs.length; i++) {
                    divs[i].style.opacity = 0;
                }

            }

        },

        sound: {

          mute: false,
          winTracks: ['ff7victory.mp3'], // Plays on win
          loseTracks: ['sadviolinmlg.mp3','heartwillgoon.mp3'], // Plays on loss
          rightTracks: [],
          wrongTracks: [],
          path: 'assets/sounds',
          bgMusic: document.getElementById('hangman-music-bg'),

          init: function() {

            this.allTracks = [];

            this.winSound = hangman.getRandom(this.winTracks);
            this.loseSound = hangman.getRandom(this.loseTracks);
            this.rightNoise = hangman.getRandom(this.rightTracks);
            this.wrongNoise = hangman.getRandom(this.wrongTracks);

            this.bgMusic.play();

          },

          toggleMute: function(el) {

            console.log(el.children);
            this.mute = this.mute ? false : true;

            var icon = this.mute ? 'glyphicon glyphicon-volume-off' : 'glyphicon  glyphicon-volume-up';

            this.bgMusic.muted = this.mute;
            el.className = icon;


          },

          right: function() {

          },
          wrong: function() {

          },
          victory: function() {

          },
          death: function() {

          },
          stop: function() {

          }

        },

        modal: {

            open: function() {

                var container = document.getElementById('modal-container');
                container.style.display = 'initial';
                container.style.opacity = 1;

                hangman.keyOff();

            },

            close: function() {

                var container = document.getElementById('modal-container');
                var box = document.getElementById('modal-content');
                container.style.display = 'none';
                container.style.opacity = 0;
                box.innerHTML = '';

                hangman.keyOn();

            },

            html: function(content) {

                var box = document.getElementById('modal-content');
                box.innerHTML = content;
                this.open();

            }

        },

    };

    // Let the games begin
    hangman.modal.html('<h1>Wecome to Hangman</h1><p>Your goal is to guess the word shown by underlining dashes. <br /><br />Press any alphabetic key to help guess the word. If you fail, a piece of the hangman will appear.  If all pieces assemble, the game is over and you lose.</p><h4>Save the hangman and you win!</h4>');
    hangman.start();

    // Event listeners
    document.getElementById('hangman-generate').addEventListener('click', function(event) {

        event.preventDefault();
        hangman.start();

    });

    document.querySelector('#hangman-sound > span').addEventListener('click', function(event) {

        event.preventDefault();
        hangman.sound.toggleMute(event.target);

    });

    document.getElementById('hangman-settings').addEventListener('click', function(event) {

        event.preventDefault();
        hangman.modal.open();

    });

    // Modal

    document.getElementById('modal-close').addEventListener('click', function(event) {

        event.preventDefault();
        hangman.modal.close();

    });

    document.getElementById('start-over').addEventListener('click', function(event) {

        event.preventDefault();
        hangman.start();
        hangman.modal.close();

    });

    document.getElementById('modal-overlay').addEventListener('click', function(event) {

        event.preventDefault();
        hangman.modal.close();

    });

})();
