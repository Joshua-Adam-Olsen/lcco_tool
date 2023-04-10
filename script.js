// Search Functions
function resultReset() {
    let resultsEl = document.querySelector('.results');
    document.querySelector('.search .text').value = '';
    resultsEl.innerHTML = "";
    resultsEl.setAttribute('style', 'display:none');
}

function search() {
    let query =  document.querySelector('.search .text').value.toLowerCase(),
        results = [],
        resultsEl = document.querySelector('.results');
    if ( 2 < query.length ) {
        resultsEl.innerHTML = "";
        // Iterate through classes, subclasses, & subjects
        document.querySelectorAll('.tabs-panel').forEach( function(i) {
            i.querySelectorAll('.accordion').forEach( function(j) {
                j.querySelectorAll('table tr td:nth-child(2) h4').forEach( function(k) {
                    let innerText = k.innerHTML.toLowerCase(),
                    queryRegEx = new RegExp('^' + query);
                    if ( innerText.includes( ' ' + query ) || queryRegEx.test(innerText) ) {
                        results.push([i,j,k]);
                    }
                }, query);
            }, query);
        }, query);
        resultsEl.setAttribute('style', 'display:block');
        resultsEl.innerHTML = "<button class='btn' onclick='resultReset()'>Clear Results</button><br>";
        resultsEl.innerHTML = resultsEl.innerHTML + "<h5>We found:</h5>";
        results.forEach( function(result) {
            resultsEl.innerHTML = resultsEl.innerHTML + "<strong>" + result[2].innerHTML + "</strong> under the <strong>" + result[1].id + "</strong> subclassification and in the <strong>" + result[0].id + "</strong> Class.<br>";
        });
        resultsEl.innerHTML = resultsEl.innerHTML + "<br><button class='btn' onclick='resultReset()'>Clear Results</button><br>";
    }
}

// Build Functions
function mkTable() {
    let table = document.createElement('table');
    table.classList.add('hover');
    table.classList.add('stack');
    let thead = document.createElement('thead'),
        tr = document.createElement('tr'),
        th = document.createElement('th');
    node = document.createTextNode('Range');
    th.appendChild(node);
    tr.appendChild(th);
    th = document.createElement('th');
    node =  document.createTextNode('Subject');
    th.appendChild(node);
    tr.appendChild(th);
    thead.appendChild(tr);
    table.appendChild(thead);
    let tbody = document.createElement('tbody');
    table.appendChild(tbody);
    return table
}

function mkTableRow(subClass, range, subject) {
    let tr = document.createElement('tr'),
        td = document.createElement('td'),
        h4 = document.createElement('h4');
    node = document.createTextNode(range);
    h4.appendChild(node);
    td.appendChild(h4);
    tr.appendChild(td);
    td = document.createElement('td');
    h4 = document.createElement('h4');
    node = document.createTextNode(subject);
    h4.appendChild(node);
    td.appendChild(h4);
    tr.appendChild(td);
    let subClassEl = document.querySelector("ul#"+subClass);
    subClassEl.querySelector("tbody").appendChild(tr);
}

function mkClassTab(label){
    // Make Class Tab
    let li = document.createElement("li"),
        link = document.createElement("a"),
        node = document.createTextNode(label.split(' - ')[0]);
    link.appendChild(node);
    li.classList.add('tabs-title');
    link.setAttribute('data-tabs-target', label.split(' - ')[0]);
    link.setAttribute('href', '#' + label.split(' - ')[0]);
    li.appendChild(link);
    document.querySelector('.tabs').appendChild(li);
}

function mkClassPanel(label) {
    // Make Class Panel
    let div = document.createElement('div'),
        h2  = document.createElement('h2');
    h2.appendChild(document.createTextNode(label.split(' - ')[1]));
    div.classList.add('tabs-panel');
    div.setAttribute('id', label.split(' - ')[0] );
    div.appendChild(h2);
    document.querySelector('.tabs-content').appendChild(div);
}

function mkSubClassAccordion(lastClass, label) {
    let ul = document.createElement('ul');
    ul.setAttribute('id', label.split(' ')[1].trim() );
    ul.classList.add('accordion');
    ul.setAttribute('data-accordion', '');
    ul.setAttribute('data-allow-all-closed', 'true');
    let li = document.createElement('li');
    li.classList.add('accordion-item');
    li.setAttribute('data-accordion-item', '');
    let link = document.createElement('a');
    link.setAttribute('href', '#!');
    link.classList.add('accordion-title');
    node = document.createTextNode(label.split(' ')[1]);
    link.appendChild(node);
    li.appendChild(link);
    let accordionContent = document.createElement('div');
    accordionContent.classList.add('accordion-content');
    accordionContent.setAttribute('data-tab-content', '');
    accordionContent.appendChild(mkTable());
    li.appendChild(accordionContent);
    ul.appendChild(li);
    document.querySelector('#'+lastClass.split(' - ')[0]).appendChild(ul);
}

// Helper Functions
function isClass(line) {
	let classRegEx = new RegExp("^CLASS");
	if ( classRegEx.test(line) ) {
		return true
	}
}

function getClass(line) {
    return line.match(/^CLASS[ES]*\s(.+)$/)[1].trim()
}

function isSubClass(line) {
	let subClassRegEx = new RegExp("^Subclass"),
        specialSubClassRegEx = new RegExp("^Class");
	if ( subClassRegEx.test(line) || specialSubClassRegEx.test(line) ) {
		return true
	}
}

function getSubClass(line) {
    let specialSubClassRegEx = new RegExp("^Class");
	if ( specialSubClassRegEx.test(line) ) {
		return line.match(/^Class(.+)$/)[1].trim()
	} else {
        return line.match(/^Subclass[es]*\s(.+)$/)[1].trim()
    }
}

function isSubject(line) {
	let subjectRegEx = new RegExp("^[A-Z]+[0-9]*");
	if ( subjectRegEx.test(line) ) {
		return true
	}
}

function getSubjectSubClass(subject) {
    let subjectSubClass = subject.match(/^([A-Z]+)/)[1];
    if ( typeof(document.querySelector('#'+subjectSubClass)) != 'undefined' && document.querySelector('#'+subjectSubClass) != null ) {
        return subjectSubClass
    } else {
        return subjectSubClass.slice(0,-1)
    }
}

function isEtcetera(line) {
    let etceteraRegEx = new RegExp("^[ \t]+[A-Za-z0-9(]");
	if ( etceteraRegEx.test(line) ) {
		return true
	}
}

function isBlank(line) {
	let blankRegEx = new RegExp("^ *$");
	if ( blankRegEx.test(line) ) {
		return true
	}
}

// Object Class and Methods
function lccoClass() {
    this.lastLine = '';
	this.lastClass = '';
    this.lastSubClass = '';
	this.classes = [];
	this.subClasses = [];
    this.subjects = [];
    this.bin = [];
}
lccoClass.prototype.load = function(rawArray) {
	// Iterate through raw array & create class and subclass front end elements
	rawArray.forEach( function(line) {
        let lastLine = this.lastLine;
		if ( isClass(line) ) {
            let newClass = getClass(line);
            this.lastClass = newClass;
			this.classes.push(newClass);
            mkClassTab(newClass);
            mkClassPanel(newClass);
            lastLine = line;
		} else if ( isSubClass(line) ) {
            let newSubClass = getSubClass(line);
            this.lastSubClass = newSubClass;
            this.subClasses.push(newSubClass);
            mkSubClassAccordion(this.lastClass, line);
            lastLine = line;
		} else if ( isSubject(line) ) {
            if ( 'INFORMATION RESOURCES (GENERAL)  ' == line ) {
                lastLine = this.lastLine;
            } else {
                this.subjects.push(line);
                lastLine = line;
            }
            if ( isSubClass(this.lastLine) ) {
                let subClassEl = document.querySelector("ul#"+getSubjectSubClass(line)+" a");
                subClassEl.innerHTML = "<span>" + subClassEl.innerHTML + "</span>&nbsp;&nbsp;&nbsp;&mdash;&nbsp;&nbsp;" + line;
                // this.subjects.pop();
            }
        } else if ( isEtcetera(line) ) {
            if ( isSubject(this.lastLine) && !isSubClass(this.lastLine) ) {
                this.subjects.pop();
                this.subjects.push(this.lastLine + line);
                lastLine = this.lastLine + line;
            }
        } else if ( isBlank(line) ) {
            // Silence is golden!
        } else {
            this.bin.push(line);
        }
        this.lastLine = lastLine;
	}, this);
}
lccoClass.prototype.addSubjects = function() {
	// Iterate through subjects and build front end
    this.subjects.forEach( function(subject){
        let subjectSubClass = getSubjectSubClass(subject),
            subjectRange = subject.split('\t')[0],
            subjectLabel = subject.match(/\t+(.*)/)[1];
        try {
            mkTableRow(subjectSubClass, subjectRange, subjectLabel);
        } catch(e) {
            mkTableRow('KJ-KKZ', subjectRange, subjectLabel);
        }
    }, this);
}

// Main function
function main(data) {
    // Split raw text on new lines into an array
    const rawArray = data.split('\r\n');
    
    // Create lcco object
    const lcco = new lccoClass();
    lcco.load(rawArray);
    lcco.addSubjects();
    
    $('.accordion').each( function() {
        if ( 2 >= $(this).find('td').length ) {
            $(this).attr('disabled', true);
            $(this).find('.accordion-title').addClass('disabled');
        }
    });
    
    document.querySelector('.search').addEventListener('submit', event => {
      event.preventDefault();
      search();
    });
}

// DOM is loaded. Document is ready. jQuery & Foundation stuff.
jQuery(document).ready( function($) {
    // Get raw lcco data from github repo.
    const url = 'https://raw.githubusercontent.com/Joshua-Adam-Olsen/lcco_tool/main/lcco.txt';
    
	$.get( url, function( data ) {
        // Execute main function.
        main(data);
        // Init Foundation 6
        $(document).foundation();
    }, 'text');
});
