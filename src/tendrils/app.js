import glContext from 'gl-context';
import throttle from 'lodash/throttle';
import dat from 'dat-gui';

import { Tendrils, defaultSettings, glSettings } from './';


export default (canvas, settings, debug) => {
    let tendrils;
    const gl = glContext(canvas, glSettings,
            (...rest) => tendrils.render(...rest));

    tendrils = new Tendrils(gl, settings);

    const state = tendrils.state;

    function resize() {
        canvas.width = self.innerWidth;
        canvas.height = self.innerHeight;
    }

    self.addEventListener('resize', throttle(resize, 100, { leading: true }),
        false);

    resize();
    tendrils.restart();


    if(debug) {
        let gui = new dat.GUI();

        gui.close();

        function updateGUI() {
            for(let f in gui.__folders) {
                gui.__folders[f].__controllers.forEach((controller) =>
                        controller.updateDisplay());
            }
        }


        // Settings


        let settingsGUI = gui.addFolder('settings');


        // Generic settings; no need to do anything special here

        let settingsKeys = [];

        for(let s in state) {
            if(!(typeof state[s]).match(/(object|array)/gi)) {
                settingsGUI.add(state, s);
                settingsKeys.push(s);
            }
        }


        // Some special cases
        
        settingsGUI.__controllers[settingsKeys.indexOf('rootNum')]
            .onFinishChange((n) => {
                tendrils.setup(n);
                tendrils.restart();
            });

        settingsGUI.__controllers[settingsKeys.indexOf('respawnAmount')]
            .onFinishChange((n) => {
                tendrils.setupSpawnData(state.rootNum);
            });

        settingsGUI.__controllers[settingsKeys.indexOf('respawnTick')]
            .onFinishChange((n) => {
                // respawnSweep();
            });


        // DAT.GUI's color controllers are a bit fucked.

        let colorGUI = {
                color: state.color.slice(0, 3).map((c) => c*255),
                opacity: state.color[3]
            };

        function convertColor() {
            state.color = [
                    ...colorGUI.color.slice(0, 3).map((c) => c/255),
                    colorGUI.opacity
                ];
        }

        settingsGUI.addColor(colorGUI, 'color').onChange(convertColor);
        settingsGUI.add(colorGUI, 'opacity').onChange(convertColor);
        convertColor();


        // Controls

        let controllers = {
                cyclingColor: false,

                clearView: () => tendrils.clearView(),
                clearFlow: () => tendrils.clearFlow(),
                reset: () => tendrils.reset(),
                restart: () => tendrils.restart()
            };


        let controlsGUI = gui.addFolder('controls');

        for(let c in controllers) {
            controlsGUI.add(controllers, c);
        }


        function cycleColor() {
            if(controllers.cyclingColor) {
                Object.assign(colorGUI, {
                    opacity: 0.2,
                    color: [
                        Math.sin(Date.now()*0.009)*200,
                        100+Math.sin(Date.now()*0.006)*155,
                        200+Math.sin(Date.now()*0.003)*55
                    ]
                });

                convertColor();
            }

            requestAnimationFrame(cycleColor);
        }

        cycleColor();


        // Presets

        let presetsGUI = gui.addFolder('presets');

        let presetters = {
                'Default': () => {
                    Object.assign(state, defaultSettings);

                    controllers.cyclingColor = false;
                    updateGUI();

                    tendrils.restart();
                },
                'Flow': () => {
                    Object.assign(state, defaultSettings, {
                            showFlow: true
                        });

                    controllers.cyclingColor = false;
                    updateGUI();
                },
                'Fluid (kinda)': () => {
                    Object.assign(state, defaultSettings, {
                            autoClearView: true,
                            showFlow: false
                        });

                    tendrils.restart();

                    Object.assign(colorGUI, {
                            opacity: 0.8,
                            color: [255, 255, 255]
                        });

                    convertColor();

                    controllers.cyclingColor = false;
                    updateGUI();
                },
                'Flow only': () => {
                    Object.assign(state, defaultSettings, {
                            autoClearView: true,
                            showFlow: false,

                            flowWeight: 0.82,
                            wanderWeight: 0,

                            startRadius: 0.6,
                            startSpeed: -0.06
                        });

                    tendrils.restart();

                    Object.assign(colorGUI, {
                            opacity: 0.8,
                            color: [100, 200, 255]
                        });

                    convertColor();

                    controllers.cyclingColor = false;
                    updateGUI();
                },
                'Noise only': () => {
                    Object.assign(state, defaultSettings, {
                            autoClearView: false,
                            showFlow: false,

                            flowWeight: 0,
                            wanderWeight: 0.002,

                            noiseSpeed: 0,

                            startRadius: 0.5,
                            startSpeed: 0
                        });

                    tendrils.restart();

                    Object.assign(colorGUI, {
                            opacity: 0.1,
                            color: [255, 150, 0]
                        });

                    convertColor();

                    controllers.cyclingColor = false;
                    updateGUI();
                },
                'Sea': () => {
                    Object.assign(state, defaultSettings, {
                            startRadius: 1.77,
                            startSpeed: -0.0001,

                            fadeOpacity: 0.6
                        });

                    tendrils.restart();

                    Object.assign(colorGUI, {
                            opacity: 0.8,
                            color: [55, 155, 255]
                        });

                    convertColor();

                    controllers.cyclingColor = false;
                    updateGUI();
                },
                'Mad styles': () => {
                    Object.assign(state, defaultSettings, {
                            startRadius: 0.1,
                            startSpeed: 0.05
                        });

                    tendrils.restart();
                    controllers.cyclingColor = true;
                    updateGUI();
                },
                'Ghostly': () => {
                    Object.assign(state, defaultSettings, {
                            autoClearView: false,
                            flowDecay: 0
                        });

                    tendrils.restart();

                    Object.assign(colorGUI, {
                            opacity: 0.006,
                            color: [255, 255, 255]
                        });

                    convertColor();

                    controllers.cyclingColor = false;
                    updateGUI();
                }
            };

        for(let p in presetters) {
            presetsGUI.add(presetters, p);
        }
    }
};





