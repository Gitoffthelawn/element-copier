import { arrow_up_default } from "./lucide/arrow-up.js";
import { chart_column_increasing_default } from "./lucide/chart-column-increasing.js";
import { circle_power_default } from "./lucide/circle-power.js";
import { cog_default } from "./lucide/cog.js";
import { copy_default } from "./lucide/copy.js";
import { external_link_default } from "./lucide/external-link.js";
import { file_down_default } from "./lucide/file-down.js";
import { files_default } from "./lucide/files.js";
import { git_fork_default } from "./lucide/git-fork.js";
import { heart_default } from "./lucide/heart.js";
import { history_default } from "./lucide/history.js";
import { image_down_default } from "./lucide/image-down.js";
import { images_default } from "./lucide/images.js";
import { info_default } from "./lucide/info.js";
import { keyboard_default } from "./lucide/keyboard.js";
import { pin_default } from "./lucide/pin.js";
import { play_default } from "./lucide/play.js";
import { puzzle_default } from "./lucide/puzzle.js";
import { rotate_cw_default } from "./lucide/rotate-cw.js";
import { settings_default } from "./lucide/settings.js";
import { shield_check_default } from "./lucide/shield-check.js";
import { square_check_default } from "./lucide/square-check.js";
import { terminal_default } from "./lucide/terminal.js";

function stripComment(svg) {
  return svg.replace(/<!--[\s\S]*?-->\s*/g, "").trim();
}

function lucideUiIcon(raw) {
  return stripComment(raw);
}

var ARROW_UP = lucideUiIcon(arrow_up_default);
var CHART_COLUMN_INCREASING = lucideUiIcon(chart_column_increasing_default);
var CIRCLE_POWER = lucideUiIcon(circle_power_default);
var COG = lucideUiIcon(cog_default);
var COPY = lucideUiIcon(copy_default);
var EXTERNAL_LINK = lucideUiIcon(external_link_default);
var FILE_DOWN = lucideUiIcon(file_down_default);
var FILES = lucideUiIcon(files_default);
var GIT_FORK = lucideUiIcon(git_fork_default);
var HEART = lucideUiIcon(heart_default);
var HISTORY = lucideUiIcon(history_default);
var IMAGE_DOWN = lucideUiIcon(image_down_default);
var IMAGES = lucideUiIcon(images_default);
var INFO = lucideUiIcon(info_default);
var KEYBOARD = lucideUiIcon(keyboard_default);
var PIN = lucideUiIcon(pin_default);
var PLAY = lucideUiIcon(play_default);
var PUZZLE = lucideUiIcon(puzzle_default);
var ROTATE_CW = lucideUiIcon(rotate_cw_default);
var SETTINGS = lucideUiIcon(settings_default);
var HEART_HANDSHAKE = lucideUiIcon(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762"/></svg>`);
var SHARE = lucideUiIcon(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v13"/><path d="m16 6-4-4-4 4"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/></svg>`);
var SHIELD_CHECK = lucideUiIcon(shield_check_default);
var SQUARE_CHECK = lucideUiIcon(square_check_default);
var TERMINAL = lucideUiIcon(terminal_default);

export { stripComment, lucideUiIcon, ARROW_UP, CHART_COLUMN_INCREASING, CIRCLE_POWER, COG, COPY, EXTERNAL_LINK, FILE_DOWN, FILES, GIT_FORK, HEART, HEART_HANDSHAKE, HISTORY, IMAGE_DOWN, IMAGES, INFO, KEYBOARD, PIN, PLAY, PUZZLE, ROTATE_CW, SETTINGS, SHARE, SHIELD_CHECK, SQUARE_CHECK, TERMINAL };
