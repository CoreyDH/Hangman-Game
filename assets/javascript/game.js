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
            this.sound.init();

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

            // Find letter in word
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
            this.modal.html('<h1 class="text-center">YOU WIN</h1><h3>The word was <strong>'+this.word+'</strong></h3>');
            this.sound.victory();
        },

        lose: function() {

            this.losses++;
            document.getElementById('hangman-losses').innerHTML = this.losses;
            this.modal.html('<h1 class="text-center">YOU LOSE</h1><h3>The word was <strong>'+this.word+'</strong></h3>');
            this.sound.defeat();
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
          rightTracks: ['violinright.mp3'], // Play on correct guess
          wrongTracks: [''], // Play on wrong guess
          path: 'assets/sounds',
          bgMusic: document.getElementById('hangman-music-bg'),

          init: function() {

            var defineCheck = true;

            while(defineCheck) {
              switch(undefined) {

                default:
                  defineCheck = false;
                  break;

                case this.winSound :
                  this.winSound = new Audio(this.path+'/'+hangman.getRandom(this.winTracks));
                  break;

                case this.loseSound :
                  this.loseSound = new Audio(this.path+'/'+hangman.getRandom(this.loseTracks));
                  break;

                case this.rightNoise :
                  this.rightNoise = new Audio(this.path+'/'+hangman.getRandom(this.rightTracks));
                  break;

                case this.wrongNoise :
                  this.wrongNoise = new Audio(this.path+'/'+hangman.getRandom(this.wrongTracks));
                  break;
              }
            }

            this.allTracks = [this.winSound, this.loseSound, this.rightNoise, this.wrongNoise];
            this.stopOther();

            this.bgMusic.play();

          },

          toggleMute: function() {

            this.mute = this.mute ? false : true;

            var icon = this.mute ? 'glyphicon glyphicon-volume-off' : 'glyphicon  glyphicon-volume-up';

            for(var i=0; i < this.allTracks.length; i++) {
              this.allTracks[i].muted = this.mute;
            }
            this.bgMusic.muted = this.mute;
            document.getElementById('hangman-sound-icon').className = icon;

          },

          right: function() {

            if(!this.mute) {
              this.rightNoise.play();
            }

          },

          wrong: function() {

            if(!this.mute) {
              this.wrongNoise.play();
            }

          },

          victory: function() {

            if(!this.mute) {
              this.bgMusic.pause();
              this.winSound.play();
            }

          },

          defeat: function() {

            if(!this.mute) {
              this.bgMusic.pause();
              this.loseSound.play();
            }

          },

          stop: function(audio) {

            audio.pause();
            audio.currentTime = 0;

          },

          stopOther: function() {

            for(var i=0; i < this.allTracks.length; i++) {
              this.allTracks[i].pause();
              this.allTracks[i].currentTime = 0;
            }

          }

        },

        modal: {

          container : document.getElementById('modal-container'),

          open: function() {

              this.container.style.display = 'initial';
              this.container.style.opacity = 1;
              this.resize();

              hangman.keyOff();

          },

          close: function() {

              this.container.style.display = 'none';
              this.container.style.opacity = 0;

              hangman.keyOn();

          },

          resize: function() {

            var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            var modalBox = document.getElementById('modal-box');

            modalBox.style.left = (windowWidth/2 - modalBox.clientWidth/2)+'px';

          },

          html: function(content) {

              var cBox = document.getElementById('modal-content');
              cBox.innerHTML = content;
              this.open();

          }

        },

    };

    // Let the games begin
    hangman.modal.html('<h1>Wecome to Hangman</h1><p>Your goal is to guess the word shown by the underlining dashes. <br /><br />Press any alphabetic key to help guess the word. If you fail, a piece of the gallows(and eventually the man) will appear.  If all pieces assemble, the game is over and you lose.</p><h4>Save the man and you win!</h4>');
    hangman.start();

    // Event listeners
    document.getElementById('hangman-generate').addEventListener('click', function(event) {

        event.preventDefault();
        hangman.start();

    });

    document.getElementById('hangman-sound').addEventListener('click', function(event) {

        event.preventDefault();
        hangman.sound.toggleMute();

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

    // Detect resize
    window.onresize = function(event) {
      hangman.modal.resize();
    };

})();
