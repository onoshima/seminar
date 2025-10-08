var jsPsychIatImage = (function (jspsych) {
  'use strict';

  var _package = {
    name: "@jspsych/plugin-iat-image",
    version: "2.0.0",
    description: "jsPsych plugin for running an IAT (Implicit Association Test) with an image stimulus",
    type: "module",
    main: "dist/index.cjs",
    exports: {
      import: "./dist/index.js",
      require: "./dist/index.cjs"
    },
    typings: "dist/index.d.ts",
    unpkg: "dist/index.browser.min.js",
    files: [
      "src",
      "dist"
    ],
    source: "src/index.ts",
    scripts: {
      test: "jest",
      "test:watch": "npm test -- --watch",
      tsc: "tsc",
      build: "rollup --config",
      "build:watch": "npm run build -- --watch"
    },
    repository: {
      type: "git",
      url: "git+https://github.com/jspsych/jsPsych.git",
      directory: "packages/plugin-iat-image"
    },
    author: "Kristin Diep",
    license: "MIT",
    bugs: {
      url: "https://github.com/jspsych/jsPsych/issues"
    },
    homepage: "https://www.jspsych.org/latest/plugins/iat-image",
    peerDependencies: {
      jspsych: ">=7.1.0"
    },
    devDependencies: {
      "@jspsych/config": "^3.0.0",
      "@jspsych/test-utils": "^1.2.0"
    }
  };

  const info = {
    name: "iat-image",
    version: _package.version,
    parameters: {
      stimulus: {
        type: jspsych.ParameterType.IMAGE,
        default: void 0
      },
      left_category_key: {
        type: jspsych.ParameterType.KEY,
        default: "e"
      },
      right_category_key: {
        type: jspsych.ParameterType.KEY,
        default: "i"
      },
      left_category_label: {
        type: jspsych.ParameterType.STRING,
        array: true,
        default: ["left"]
      },
      right_category_label: {
        type: jspsych.ParameterType.STRING,
        array: true,
        default: ["right"]
      },
      key_to_move_forward: {
        type: jspsych.ParameterType.KEYS,
        default: "ALL_KEYS"
      },
      display_feedback: {
        type: jspsych.ParameterType.BOOL,
        default: false
      },
      html_when_wrong: {
        type: jspsych.ParameterType.HTML_STRING,
        default: '<span style="color: red; font-size: 80px">X</span>'
      },
      bottom_instructions: {
        type: jspsych.ParameterType.HTML_STRING,
        default: "<p>If you press the wrong key, a red X will appear. Press any key to continue.</p>"
      },
      force_correct_key_press: {
        type: jspsych.ParameterType.BOOL,
        default: false
      },
      stim_key_association: {
        type: jspsych.ParameterType.SELECT,
        options: ["left", "right"],
        default: void 0
      },
      response_ends_trial: {
        type: jspsych.ParameterType.BOOL,
        default: true
      },
      trial_duration: {
        type: jspsych.ParameterType.INT,
        default: null
      },
      /** How long to pause before next trial starts */
      iti: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Inter-trial interval",
        default: 250
      }
    },
    data: {
      stimulus: {
        type: jspsych.ParameterType.STRING
      },
      response: {
        type: jspsych.ParameterType.STRING
      },
      correct: {
        type: jspsych.ParameterType.BOOL
      },
      rt: {
        type: jspsych.ParameterType.INT
      }
    }
  };
  class IatImagePlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    static info = info;
    trial(display_element, trial) {
      var html_str = "";
      html_str += "<div style='position: absolute; height: 20%; width: 100%; margin-left: auto; margin-right: auto; top: 42%; left: 0; right: 0'><img src='" + trial.stimulus + "' id='jspsych-iat-stim'></img></div>";
      html_str += "<div id='trial_left_align' style='position: absolute; top: 18%; left: 20%'>";
      if (trial.left_category_label.length == 1) {
        html_str += trial.left_category_key + " キーを押す<br> " +
        "<span class='category'>" +
        trial.left_category_label[0] +
        "</span></div>";
      } else {
        html_str += trial.left_category_key + " キーを押す<br> " +
        "<span class='category concept'>" +
        trial.left_category_label[0] +
        "</span><br>または<br>" +
        "<span class='category attribute'>" +
        trial.left_category_label[1] +
        "</span></div>";
      }
      html_str += "<div id='trial_right_align' style='position: absolute; top: 18%; right: 20%'>";
      if (trial.right_category_label.length == 1) {
        html_str += trial.right_category_key + " キーを押す<br> " +
        "<span class='category'>" +
        trial.right_category_label[0] +
        "</span></div>";
      } else {
        html_str += trial.right_category_key + " キーを押す<br> " +
        "<span class='category concept'>" +
        trial.right_category_label[0] +
        "</span><br>または<br>" +
        "<span class='category attribute'>" +
        trial.right_category_label[1] +
        "</span></div>";
      }
      html_str += "<div id='wrongImgID' style='position:relative; top: 300px; margin-left: auto; margin-right: auto; left: 0; right: 0'>";
      if (trial.display_feedback === true) {
        html_str += "<div id='wrongImgContainer' style='visibility: hidden; position: absolute; top: -75px; margin-left: auto; margin-right: auto; left: 0; right: 0'><p>" + trial.html_when_wrong + "</p></div>";
        html_str += "<div>" + trial.bottom_instructions + "</div>";
      } else {
        html_str += "<div>" + trial.bottom_instructions + "</div>";
      }
      html_str += "</div>";
      display_element.innerHTML = html_str;
      var response = {
        rt_first_response: null,
        key: null,
        correct: false,
        rt_last_response: null
      };
      const end_trial = () => {
        if (typeof keyboardListener !== "undefined") {
          this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }
        // gather the data to store for the trial
        var trial_data = {
          rt_first_response: response.rt_first_response,
          stimulus: trial.stimulus,
          response: response.key,
          correct: response.correct,
          rt_last_response: response.rt_last_response
        };
        // clears the stimulus and the feedback message
        let iat_stim = display_element.querySelector("#jspsych-iat-stim");
        iat_stim.style.visibility = "hidden";
        let wImg = document.getElementById("wrongImgContainer");
        wImg.style.visibility = "hidden";

         // move on to the next trial
         this.jsPsych.pluginAPI.setTimeout(() => {
          this.jsPsych.finishTrial(trial_data);;
        }, trial.iti);
      };
      var leftKeyCode = trial.left_category_key;
      var rightKeyCode = trial.right_category_key;
      
      // flag to start the second keyboardListner
      let is_first_response = true;

      const after_response = (info2) => {
        var wImg = document.getElementById("wrongImgContainer");
        display_element.querySelector("#jspsych-iat-stim").className += " responded";
        if (response.key == null) {
          response.key = info2.key;
          response.rt_first_response = info2.rt;
        }
        // record the last response
        response.rt_last_response = info2.rt;
        
        if (trial.stim_key_association == "right") {
          if (response.rt !== null && this.jsPsych.pluginAPI.compareKeys(response.key, rightKeyCode)) {
            response.correct = true;
            if (trial.response_ends_trial) {
              end_trial();
            }
          } else {
            response.correct = false;
            if (!trial.response_ends_trial && trial.display_feedback == true) {
              wImg.style.visibility = "visible";
            }
            if (trial.response_ends_trial && trial.display_feedback == true) {
              wImg.style.visibility = "visible";
              if (trial.force_correct_key_press) {
                // start the response lisnter only when first wroong response
                if (is_first_response) {
                  this.jsPsych.pluginAPI.getKeyboardResponse({
                      callback_function: end_trial,
                      valid_responses: [trial.right_category_key],
                  });
                  is_first_response = false;
                }
              } else {
                this.jsPsych.pluginAPI.getKeyboardResponse({
                  callback_function: end_trial,
                  valid_responses: trial.key_to_move_forward
                });
              }
            } else if (trial.response_ends_trial && trial.display_feedback != true) {
              end_trial();
            } else if (!trial.response_ends_trial && trial.display_feedback != true) ;
          }
        } else if (trial.stim_key_association == "left") {
          if (response.rt !== null && this.jsPsych.pluginAPI.compareKeys(response.key, leftKeyCode)) {
            response.correct = true;
            if (trial.response_ends_trial) {
              end_trial();
            }
          } else {
            response.correct = false;
            if (!trial.response_ends_trial && trial.display_feedback == true) {
              wImg.style.visibility = "visible";
            }
            if (trial.response_ends_trial && trial.display_feedback == true) {
              wImg.style.visibility = "visible";
              if (trial.force_correct_key_press) {
                // start the response lisnter only when first wroong response
                if (is_first_response) {
                  this.jsPsych.pluginAPI.getKeyboardResponse({
                      callback_function: end_trial,
                      valid_responses: [trial.left_category_key],
                  });
                  is_first_response = false;
                }
              } else {
                this.jsPsych.pluginAPI.getKeyboardResponse({
                  callback_function: end_trial,
                  valid_responses: trial.key_to_move_forward
                });
              }
            } else if (trial.response_ends_trial && trial.display_feedback != true) {
              end_trial();
            } else if (!trial.response_ends_trial && trial.display_feedback != true) ;
          }
        }
      };
      if (trial.left_category_key != "NO_KEYS" && trial.right_category_key != "NO_KEYS") {
        var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: [trial.left_category_key, trial.right_category_key],
          rt_method: "performance",
          persist: true,
          allow_held_key: false
        });
      }
      if (trial.trial_duration !== null && trial.response_ends_trial != true) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          end_trial();
        }, trial.trial_duration);
      }
    }
    simulate(trial, simulation_mode, simulation_options, load_callback) {
      if (simulation_mode == "data-only") {
        load_callback();
        this.simulate_data_only(trial, simulation_options);
      }
      if (simulation_mode == "visual") {
        this.simulate_visual(trial, simulation_options, load_callback);
      }
    }
    create_simulation_data(trial, simulation_options) {
      const key = this.jsPsych.pluginAPI.getValidKey([
        trial.left_category_key,
        trial.right_category_key
      ]);
      const correct = trial.stim_key_association == "left" ? key == trial.left_category_key : key == trial.right_category_key;
      const default_data = {
        stimulus: trial.stimulus,
        response: key,
        rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
        correct
      };
      const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
      this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
      return data;
    }
    simulate_data_only(trial, simulation_options) {
      const data = this.create_simulation_data(trial, simulation_options);
      this.jsPsych.finishTrial(data);
    }
    simulate_visual(trial, simulation_options, load_callback) {
      const data = this.create_simulation_data(trial, simulation_options);
      const display_element = this.jsPsych.getDisplayElement();
      this.trial(display_element, trial);
      load_callback();
      if (data.response !== null) {
        this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
      }
      const cont_rt = data.rt == null ? trial.trial_duration : data.rt;
      if (trial.force_correct_key_press) {
        if (!data.correct) {
          this.jsPsych.pluginAPI.pressKey(
            trial.stim_key_association == "left" ? trial.left_category_key : trial.right_category_key,
            cont_rt + this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true)
          );
        }
      } else {
        this.jsPsych.pluginAPI.pressKey(
          this.jsPsych.pluginAPI.getValidKey(trial.key_to_move_forward),
          cont_rt + this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true)
        );
      }
    }
  }

  return IatImagePlugin;

})(jsPsychModule);
