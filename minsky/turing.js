var trace, malicious_trace, benign_trace, a_trace;
var i = 0;

mal_trace_promise = fetch('malicious_trace.json').then(response => response.json());
ben_trace_promise = fetch('benign_trace.json').then(response => response.json());
a_trace_promise = fetch('a_trace.json').then(response => response.json());
naive_trace_promise = fetch('naive_trace.json').then(response => response.json());

Promise.all([mal_trace_promise, ben_trace_promise, a_trace_promise, naive_trace_promise])
	.then(values => run(values[0], values[1], values[2], values[3]));

function run(mal_trace, ben_trace, aa_trace, nai_trace) {
	malicious_trace = mal_trace;
	benign_trace = ben_trace;
	a_trace = aa_trace;
	naive_trace = nai_trace;
	trace = benign_trace;


	playing = false;
	speed = 1024;
/*
        desc0 = "";
	desc1a = "Quoting Minsky: 'To start, the \"locate\" machine of [phase i] is put into operation. It first searches to the right to find the first state-symbol pair that matches the one represented in the \"machine condition\" area. On the path to the desired state-symbol pair, it changes all <b>0</b>'s and <b>1</b>'s to <b>A</b>'s and <b>B</b>'s. After finding the desired pair, and changing it also to <b>A</b>'s and <b>B</b>'s, it runs back to the leftmost <b>X</b> [of the machine description <i>d<sub>T</sub></i>].'";
	desc1b = "Minsky continues: 'Next the \"copy\" machine of [phase ii] is put into operation. It starts on the leftmost <b>X</b> [of <i>d<sub>T</sub></i>], and from there shifts to the right until it has gone past the last <b>A</b> or <b>B</b> and sees for the first time some <b>0</b>'s and <b>1</b>'s. These <b>0</b>'s and <b>1</b>'s describe the new state <i>Q<sub>ij</sub></i> of <i>T</i>, the new symbol <i>S<sub>ij</sub></i> which must eventually be printed in location <b>M</b>, and the direction of motion <i>D<sub>ij</sub></i>. Next, the machine copies the  <b>0'</b>s and <b>l'</b>s representing <i>Q<sub>ij</sub></i> and <i>S<sub>ij</sub></i> into the machine-condition region; it does not print <i>D<sub>ij</sub></i> but just remembers it.'";
	desc1c = "Minsky: 'In its third phase, the machine shifts to the left until it reaches <b>M</b>. There it erases <b>M</b> and prints (temporarily) in its place the direction <i>D<sub>ij</sub></i> (= <b>A</b> or <b>B</b>) which it has until now remembered. This information was retained in the choice between the two exit arrows of [phase ii]. Then the machine shifts to the right and changes all <b>A</b>'s and <b>B</b>'s on the tape to <b>0</b>'s and <b>1</b>'s, except for the <b>A</b> or <b>B</b> in <b>M</b>'s old location that now represents <i>D<sub>ij</sub></i>. Finally, it moves to the immediate left of the leftmost <b>X</b> [of <i>d<sub>T</sub></i>]. It erases the <i>S<sub>ij</sub></i> which is there, remembers it, and prints <b>S</b> in its place. (<b>S</b> is a special letter used only for this marking job.)'"
	desc1d = "Minsky: 'Now in its final phase, the work of the machine <i>T</i> is about to be completed. The machine shifts to the left until it encounters for the first time an <b>A</b> or <b>B</b>. This <b>A</b> or <b>B</b> represents the direction <i>D<sub>ij</sub></i> that <i>T</i> should next move. The machine prints <i>S<sub>ij</sub></i> = <b>0</b> or <b>1</b> in place of the <b>A</b> or <b>B</b>.'"
	desc2a = "With well-formed input, <i>U</i> would now shift one square left since <i>D<sub>ij</sub></i>=<b>A</b>, read the new tape square, remember whether it was <b>0</b> or <b>1</b>, and print an <b>M</b> in its place. However, instead of encountering the expected <b>0</b> or <b>1</b>, <i>U</i> reads a maliciously placed <b>S</b>. This triggers an implicit quintuple (<i>q<sub>i</sub></i>,<i>s<sub>j</sub></i>,<i>q<sub>i</sub></i>,<i>s<sub>j</sub></i>,<i>d<sub>ij</sub></i>) which causes <i>U</i> to shift further left. Here, it reads a series of <b>A'</b>s, <b>B'</b>s, <b>X'</b>s and <b>Y'</b>s, triggering the same implicit quintuple, shifting the head of <i>U</i> far to the left. The maliciously crafted data thus forces the UTM into a state that Minsky did not consider. Until the end of the next cycle, the UTM is neither executing according to Minsky's intentions nor does it appear to be completely under the attacker's control."
	desc2b = "<i>U</i> continues left until it encounters the first <b>1</b>, where it drops the marker <b>M</b> representing <i>T'</i>s head. <i>U</i> now aims to return to the point of origin, which was marked by an <b>S</b> in the previous phase. However, a maliciously placed <b>S</b> stops <i>U</i> early. At the end of <i>U'</i>s first execution cycle, not only <i>T'</i>s, but also <i>U'</i>s head comes to rest further to the left than expected. Importantly, <i>U'</i>s head is located to the left of the symbol <b>Y</b> indicating the end of <i>T'</i>s tape.";
	desc3 = "At the start of the second cycle, <i>U'</i>s head is located in the attacker-controlled segment of the tape instead of in the intended machine condition of <i>T</i>. In it's attempt to identify the next quintuple to execute, <i>U</i> is tricked into reading the injected machine condition, <i>q(i)s(i)</i>=<b>BAA</b> rather than the original one, <i>q(t)s(t)</i>. At this point, the attack would have been simple to complete if it had been possible for the attacker to provide the injected machine description, <i>d<sub>I</sub></i>, in the form of <b>0</b>'s and <b>1</b>'s instead of <b>A</b>'s and <b>B</b>'s. As seen, that was however not possible. Therefore, looking for <b>0</b>'s and <b>1</b>'s rather than <b>A</b>'s and <b>B</b>'s, <i>U'</i>s head won't find anything in <i>d<sub>I</sub></i>. Instead, it encounters the first match, <b>100</b> just before the <b>Y</b> representing the end of <i>T'</i>s tape. The initial <b>1</b> is the result of <i>T'</i>s first and successful print operation. The ensuing <b>00</b> are simply a part of a buffer between <i>T'</i>s tape and machine condition, Q<sub>T</sub>S<sub>T</sub>.";
	desc4 = "In the second phase of the second cycle, attempting to collect the action part of the identified quintuple, <i>U</i> will find the four digits closest to the right of its head. While these were supposed to constitute the tail end of a quintuple, they are instead pieces of the tape buffer, of <i>T'</i>s machine condition, <i>q(t)s(t)</i>, and <i>T'</i>s first quintuple, jointly creating the string <b>0010</b>, which is thus interpreted as <i>Q<sub>ij</sub>S<sub>ij</sub>D<sub>ij</sub></i>. Furthermore, in the middle of the attempt to copy the first three digits to the injected machine condition, <i>q(i)s(i)</i>, <i>U</i> slips back to the right of the <b>Y</b> indicating the start of <i>T'</i>s machine condition, <i>q(t)s(T)</i>. The end result is that the first digit is copied to <i>q(i)</i> while the remaining part is copied to <i>q(t)s(t)</i>. The UTM now behaves as a <i>weird machine</i> as detailed in <i>Bratus. S. et al., Exploit programming, USENIX ;login:, 2011.</i>";
	desc5 = "The third phase replaces <i>T'</i>s head, <b>M</b>, with a symbol indicating the direction of the head. It then reverts the <b>A'</b>s and <b>B'</b>s to <b>0'</b>s and <b>1'</b>s. This is important for the attack, as the injected quintuples now assume the required form to allow execution. At the end of the third phase, <i>U'</i>s head is once again positioned far into the untrusted, user-provided data.";
	desc6 = "In the fourth and final phase of the second execution cycle, <i>U</i> shifts <i>T'</i>s head one step and records in <i>I'</i>s machine condition, <i>q(i)s(i)</i>, the symbol under <b>M</b>. At this point, the compromise is complete, as the injected machine, <i>I</i>, is syntactically correct, and the head of <i>U</i> is located in the injected machine condition, <i>q(i)s(i)</i>, rather than in the originally intended one, <i>q(t)s(t)</i>. The head will never again traverse the <b>Y</b> denoting the end of <i>T'</i>s tape.";
	desc7 = "The following execution cycles will faithfully execute the injected machine, <i>I</i>, wiping the contents of the inputs provided <i>I</i>.";
*/

	document.getElementById("description").innerHTML = desc1a;

	update();
}

function update() {
	state = trace[i].state;
	filename = "UTM_" + state.toString() + ".jpeg";
	document.getElementById("utm").src = filename;
	document.getElementById("tape").innerHTML = trace[i].tape.substring(0,trace[i].head) + "<b>" + trace[i].tape.substring(trace[i].head,trace[i].head+1) + "</b>" + trace[i].tape.substring(trace[i].head+1);
	document.getElementById("step").innerHTML = "Step " + i;
//	describe();
}

function step() {
	i = i + 1;
	update();
}

function play_pause() {
	if (playing) {
		clearInterval(timer);
		playing = false;
	}
	else {
		timer = setInterval(step, speed);
		playing = true;
	}
}

function back() {
	i = i - 1;
	update();
}

function reset() {
	i = 0;
	update()
}

function goto_next_phase() {
	start_states = new Set([6,7,13,14,22,23])
	start_states.delete(trace[i].state)
	goto_states(start_states)
}

function goto_states(states) {
	do {
		i = i + 1;
	} while(!states.has(trace[i].state))
	update();
}

function change_speed(factor) {
	speed = speed*factor;
	if (playing) {
		clearInterval(timer)
		timer = setInterval(step, speed)
	}
}

function switch_tape() {
	if(trace == malicious_trace) {
		trace = benign_trace;
		document.getElementById("tape_button").innerHTML = "Switch to 'A' tape";
	}
	else if(trace == a_trace) {
		trace = naive_trace;
		document.getElementById("tape_button").innerHTML = "Switch to malicious tape";
	}
	else if(trace == naive_trace) {
		trace = malicious_trace;
		document.getElementById("tape_button").innerHTML = "Switch to benign tape";
	}
	else {
		trace = a_trace;
		document.getElementById("tape_button").innerHTML = "Switch to naïve tape";
	}
	reset();
}
/*
function describe() {
	document.getElementById("description").innerHTML = "";
	if(trace == malicious_trace) {
		if(i > 0 && i <= 137) {
			document.getElementById("description").innerHTML = desc1a;
		}
		if(i > 137 && i <= 277) {
			document.getElementById("description").innerHTML = desc1b;
		}
		if(i > 277 && i <= 328) {
			document.getElementById("description").innerHTML = desc1c;
		}
		if(i > 328 && i <= 335) {
			document.getElementById("description").innerHTML = desc1d;
		}
		if(i > 335 && i <= 356) {
			document.getElementById("description").innerHTML = desc2a;
		}
		if(i > 356 && i <= 378) {
			document.getElementById("description").innerHTML = desc2b;
		}
		if(i > 378 && i <= 534) {
			document.getElementById("description").innerHTML = desc3;
		}
		if(i > 534 && i <= 619) {
			document.getElementById("description").innerHTML = desc4;
		}
		if(i > 619 && i <= 709) {
			document.getElementById("description").innerHTML = desc5;
		}
		if(i > 709 && i <= 719) {
			document.getElementById("description").innerHTML = desc6;
		}
		if(i > 719) {
			document.getElementById("description").innerHTML = desc7;
		}
	}
	if(trace == benign_trace) {
		document.getElementById("description").innerHTML = desc0;
	}
}
*/
