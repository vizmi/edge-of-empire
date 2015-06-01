'use strict'

///////////////
//  helpers  //
///////////////

var CHAR_PRICES = [0, 10, 30, 60, 100, 150];

function xpBudget(master, character) {
	var a = master.additionalObligations;
	var x = master.species[character.species].xp;
	x += character.obligation.additional.reduce(function(prev, item, index) {
		return prev + (item ? a[index].xp : 0);
	}, 0);

	return x;
}

function xpSpent(master, character) {
		var specs = master.specializations;
		var career = character.career.id;
		var x = character.additionalSpecializations.reduce(function(prev, item, index) {
			return prev + ((specs[item].career === career) ? (index + 1) * 10 : (index + 2) * 10);
		}, 0);

		var startChars = master.species[character.species].characteristics;
		var chars = character.characteristics;
		x += chars.reduce(function(prev, item, index) {
			return (prev + (CHAR_PRICES[item] - CHAR_PRICES[startChars[index]]));
		}, 0);
		
		return x;
}

function maxChar(current, xp) {
	var r = current;
	while ((CHAR_PRICES[r] - CHAR_PRICES[current]) <= xp) {
		r++;
	}
	return (r - 1);
}

/////////////////////
//  React classes  //
/////////////////////

var CharacterGenerator = React.createClass({displayName: "CharacterGenerator",

	getInitialState: function() {
		var state = {
			name: '',
			species: 3,
			obligation: {
				type: 3,
				value: 10,
				additional: [false, false, false, false]
			},
			career: {
				id: 4,
				skills: []
			},
			specialization: {
				id: 12,
				skills: []
			},
			additionalSpecializations: [],
			characteristics: [2, 2, 2, 2, 2, 2]
		};
		
		return state;
	},


	//  ui events  //
	
	onNameChange: function(event) {
		this.setState({ name: event.target.value });
	},

	onSpeciesChange: function(event) {
		var sp = parseInt(event.target.value);
		var ch = this.props.master.species[sp].characteristics.slice(); // shallow copy the array
		this.setState({ species: sp, characteristics: ch });
	},

	onObligationTypeChange: function(event) {
		var t = parseInt(event.target.value);
		var s = React.addons.update(this.state, { obligation: { type: { $set: t }}});
		this.setState(s);
	},

	onObligationValueChange: function(event) {
		var v = parseInt(event.target.value);
		var o = this.state.obligation.value;
		var s = React.addons.update(this.state, { obligation: { value: { $set: v }}});
		if (v < o) {
			s = React.addons.update(s, { obligation: { additional: { $set: [false, false, false, false] }}});
		}
		this.setState(s);
	},

	onAdditionalObligationChange: function(event) {
		var i = event.target.value;
		var v = event.target.checked;
		var s = React.addons.update(this.state, { obligation: { additional: { $splice: [[i, 1, v]] }}});
		this.setState(s);
	},

	onCareerChange: function(event) {
		var c = parseInt(event.target.value);
		var sp = this.props.master.careers[c].specializations[0];
		var s = React.addons.update(this.state, {
			career: { id: { $set: c}, skills: {$set: []}},
			specialization: { id: {$set: sp}, skills: {$set: []}}
		});
		// remove spec from the additonal specs list
		var i = this.state.additionalSpecializations.indexOf(sp);
		if (i !== -1) {
			s = React.addons.update(this.state, {additionalSpecializations: { $splice: [[i, 1]] }});
		}
		this.setState(s);
	},

	onCareerSkillChange: function(event) {
		var skill = parseInt(event.target.value);
		var i = this.state.career.skills.indexOf(skill);
		if (i === -1) {
			var s = React.addons.update(this.state, {career: { skills: { $push: [skill] }}});
		} else {
			var s = React.addons.update(this.state, {career: { skills: { $splice: [[i, 1]] }}});
		}
		this.setState(s);
	},

	onSpecializationChange: function(event) {
		var sp = parseInt(event.target.value);
		var s = React.addons.update(this.state, {
			specialization: { id: {$set: sp}, skills: {$set: []}}
		});
		// remove spec from the additonal specs list
		var i = this.state.additionalSpecializations.indexOf(sp);
		if (i !== -1) {
			s = React.addons.update(this.state, {additionalSpecializations: { $splice: [[i, 1]] }});
		}
		this.setState(s);
	},

	onSpecSkillChange: function(event) {
		var skill = parseInt(event.target.value);
		var i = this.state.specialization.skills.indexOf(skill);
		if (i === -1) {
			var s = React.addons.update(this.state, {specialization: { skills: { $push: [skill] }}});
		} else {
			var s = React.addons.update(this.state, {specialization: { skills: { $splice: [[i, 1]] }}});
		}
		this.setState(s);
	},

	onAdditionalSpecializationClick: function(event) {
		var sp = parseInt(event.target.value);
		var i = this.state.additionalSpecializations.indexOf(sp);
		if (i === -1) {
			var s = React.addons.update(this.state, {additionalSpecializations: { $push: [sp] }});
		} else {
			var s = React.addons.update(this.state, {additionalSpecializations: { $splice: [[i, 1]] }});
		}
		this.setState(s);
	},

	onCharacteristicChange: function(event) {
		var i = parseInt(event.target.id.substring(5,6));
		var v = parseInt(event.target.value);
		var min = parseInt(event.target.min);
		var max = parseInt(event.target.max);

		if (isNaN(v) || v > max || v < min) {
			return false;
		}
		var s = React.addons.update(this.state, { characteristics: { $splice: [[i, 1, v]] }});
		this.setState(s);
	},

	//  render  //

	render: function() {

		var speciesOptions = this.props.master.species.map(function (item, index) {
			return (
				React.createElement("option", {key: index, value: index}, item.name)
			);
		});

		return (
			React.createElement("form", null, 
				React.createElement("div", {className: "row"}, 
					React.createElement("div", {className: "col-xs-10 col-xs-offset-1"}, 
						React.createElement("div", {className: "row navigator", id: "general"}, 
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement("div", {className: "panel panel-default"}, 
									React.createElement("div", {className: "panel-heading"}, 
										React.createElement("h3", {className: "panel-title"}, "General information")
									), 
									React.createElement("div", {className: "panel-body"}, 
										React.createElement("div", {className: "row"}, 
											React.createElement("div", {className: "col-sm-6"}, 
												React.createElement("div", {className: "form-group"}, 
													React.createElement("label", {htmlFor: "nameInput"}, "Name"), 
													React.createElement("input", {type: "text", className: "form-control input-sm", id: "nameInput", placeholder: "name your character", 
															value: this.state.name, onChange: this.onNameChange})
												)
											), 
											React.createElement("div", {className: "col-sm-6"}, 
												React.createElement("div", {className: "form-group"}, 
													React.createElement("label", {htmlFor: "xp"}, "XP:"), 
													React.createElement("div", {id: "xp"}, 
														React.createElement(XP, {master: this.props.master, character: this.state})
													)
												)
											)
										), 
										React.createElement("div", {className: "row"}, 
											React.createElement("div", {className: "col-sm-6"}, 
												React.createElement("div", {className: "form-group"}, 
													React.createElement("label", {htmlFor: "speciesSelect"}, "Species"), 
													React.createElement("select", {className: "form-control input-sm", id: "speciesSelect", 
															value: this.state.species, onChange: this.onSpeciesChange}, 
														speciesOptions
													)
												)
											), 
											React.createElement("div", {className: "col-sm-6"}, 
												React.createElement("div", {className: "form-group"}, 
													React.createElement("label", {htmlFor: "creditsPar"}, "Credits:"), 
													React.createElement("p", {id: "creditsPar", className: "form-control-static"}, " 5000 Cr ")
												)
											)
										)
									)
								)
							)
						), 
						React.createElement("div", {className: "row"}, 
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement(Obligation, {
										master: this.props.master, 
										obligation: this.state.obligation, 
										onTypeChange: this.onObligationTypeChange, 
										onValueChange: this.onObligationValueChange, 
										onAdditionalChange: this.onAdditionalObligationChange})
							)
						), 
						React.createElement("div", {className: "row"}, 
							React.createElement("div", {className: "col-sm-6"}, 
								React.createElement(Career, {
										master: this.props.master, 
										career: this.state.career, 
										onCareerChange: this.onCareerChange, 
										onCareerSkillChange: this.onCareerSkillChange})
							), 
							React.createElement("div", {className: "col-sm-6"}, 
								React.createElement(Specialization, {
										master: this.props.master, 
										careerId: this.state.career.id, 
										specialization: this.state.specialization, 
										onSpecializationChange: this.onSpecializationChange, 
										onSpecSkillChange: this.onSpecSkillChange})
							)
						), 
						React.createElement("div", {className: "row"}, 
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement(AdditionalSpecializations, {
										master: this.props.master, 
										character: this.state, 
										onClick: this.onAdditionalSpecializationClick})
							)
						), 
						React.createElement("div", {className: "row navigator", id: "characteristics"}, 
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement(Characteristics, {
										master: this.props.master, 
										character: this.state, 
										onChange: this.onCharacteristicChange})
							)
						), 
						React.createElement("div", {className: "row navigator", id: "skills"}, 
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement(Skills, {skills: this.props.master.skills, 
									characteristics: this.props.master.characteristics})
							)
						), 
						React.createElement("div", {className: "row navigator", id: "equipment"}, 
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement("div", {className: "panel panel-default"}, 
									React.createElement("div", {className: "panel-heading"}, 
										React.createElement("h3", {className: "panel-title"}, " Equipment ")
									), 
									React.createElement("div", {className: "panel-body"}, 
										"Equipment"
									)
								)
							)
						)
						
					)
				)
			)
		);
	}
});

var Obligation = React.createClass({displayName: "Obligation",
	render: function() {

		var typeOptions = this.props.master.obligations.map(function(item, index) {
			return (
				React.createElement("option", {key: index, value: index}, item.name)
			);
		});

		var addObligations = this.props.master.additionalObligations;
		var totalAdditional = this.props.obligation.additional.reduce(function(prev, curr, index) {
			return (prev + (curr ? addObligations[index].obligation : 0));
		}, 0);

		var checkBoxes = addObligations.map(function(item, index) {
			var addStatus = this.props.obligation.additional[index];
			var disable = !addStatus && (item.obligation > this.props.obligation.value - totalAdditional);
			
			return (
				React.createElement("div", {key: index, className: disable ? "checkbox disabled" : "checkbox"}, 
					React.createElement("label", null, 
						React.createElement("input", {type: "checkbox", value: index, checked: addStatus, disabled: disable, 
							onChange: this.props.onAdditionalChange}), 
						item.name
					)
				)
			);
		}, this);

		return (
			React.createElement("div", {className: "panel panel-default"}, 
				React.createElement("div", {className: "panel-heading"}, 
					React.createElement("h3", {className: "panel-title"}, "Obligation")
				), 
				React.createElement("div", {className: "panel-body"}, 
					React.createElement("div", {className: "col-sm-6"}, 
						React.createElement("div", {className: "form-group"}, 
							React.createElement("label", {htmlFor: "obligationTypeSelect"}, "Type"), 
							React.createElement("select", {className: "form-control input-sm", id: "obligationTypeSelect", 
								value: this.props.obligation.type, onChange: this.props.onTypeChange}, 
								typeOptions
							)
						), 
						React.createElement("div", {className: "form-group"}, 
							React.createElement("label", {htmlFor: "obligationSizeSelect"}, "Starting Value"), 
							React.createElement("select", {className: "form-control input-sm", id: "speciesSelect", 
								value: this.props.obligation.value, onChange: this.props.onValueChange}, 
								React.createElement("option", {value: "20"}, "20 (2 players)"), 
								React.createElement("option", {value: "15"}, "15 (3 players)"), 
								React.createElement("option", {value: "10"}, "10 (4-5 players)"), 
								React.createElement("option", {value: "5"}, "5  (6+ players)")
							)
						)
					), 
					React.createElement("div", {className: "col-sm-6"}, 
						React.createElement("div", {className: "form-group"}, 
							React.createElement("label", {htmlFor: "additionalObligationCheckbox"}, "Additional Obligation"), 
							React.createElement("div", {id: "additionalObligationCheckboxes"}, 
								checkBoxes
							)
						)
					)
				), 
				React.createElement("div", {className: "panel-footer"}, 
					"Total obligation: ", (this.props.obligation.value + totalAdditional)
				)
			)
		);
	}
});

var Career = React.createClass({displayName: "Career",
	render: function() {

		var careerOptions = this.props.master.careers.map(function(item, index) {
			return (
				React.createElement("option", {key: index, value: index}, item.name)
			);
		});

		var skillList = this.props.master.skills;
		var skills = this.props.career.skills;
		var selectedCareer = this.props.master.careers[this.props.career.id];
		var onChange = this.props.onCareerSkillChange;

		var count = skills.length;
		var total = 4;
		var full = (count === total);

		var skillCheckBoxes = selectedCareer.skills.map(function(item) {
			var status = (skills.indexOf(item) !== -1);
			var disable = !status && full;

			return (
				React.createElement("div", {key: item, className: disable ? "checkbox disabled" : "checkbox"}, 
					React.createElement("label", null, 
						React.createElement("input", {type: "checkbox", value: item, 
								checked: status, disabled: disable, 
								onChange: onChange}), 
						skillList[item].name
					)
				)
			);
		});

		return (
			React.createElement("div", {className: "panel panel-default"}, 
				React.createElement("div", {className: "panel-heading"}, 
					React.createElement("h3", {className: "panel-title"}, "Career")
				), 
				React.createElement("div", {className: "panel-body"}, 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "CareerSelect"}, "Name"), 
						React.createElement("select", {className: "form-control input-sm", id: "CareerSelect", 
								value: this.props.career.id, onChange: this.props.onCareerChange}, 
							careerOptions
						)
					), 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "careerSkillCheckbox"}, "Skills"), 
						React.createElement("div", {id: "careerSkillCheckbox"}, 
							skillCheckBoxes
						)
					)
				), 
				React.createElement("div", {className: "panel-footer"}, 
					"Skills selected: ", count, " / ", total
				)
			)
		);
	}
});

var Specialization = React.createClass({displayName: "Specialization",
	render: function() {
		var selectedCareer = this.props.master.careers[this.props.careerId];
		var specs = this.props.master.specializations;

		var specializationOptions	= selectedCareer.specializations.map(function(item) {
			return (
				React.createElement("option", {key: item, value: item}, specs[item].name)
			);
		});

		var skillList = this.props.master.skills;
		var skills = this.props.specialization.skills;
		var selectedSpecialization = this.props.master.specializations[this.props.specialization.id];
		var onChange = this.props.onSpecSkillChange;

		var count = skills.length;
		var total = 2;
		var full = (count === total);

		var skillCheckBoxes = selectedSpecialization.skills.map(function(item) {
			var status = (skills.indexOf(item) !== -1);
			var disable = !status && full;

			return (
				React.createElement("div", {key: item, className: disable ? "checkbox disabled" : "checkbox"}, 
					React.createElement("label", null, 
						React.createElement("input", {type: "checkbox", value: item, 
								checked: status, disabled: disable, 
								onChange: onChange}), 
						skillList[item].name
					)
				)
			);
		});

		return (
			React.createElement("div", {className: "panel panel-default"}, 
				React.createElement("div", {className: "panel-heading"}, 
					React.createElement("h3", {className: "panel-title"}, "Specialization")
				), 
				React.createElement("div", {className: "panel-body"}, 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "SpecializationSelect"}, "Name"), 
						React.createElement("select", {className: "form-control input-sm", id: "SpecializationSelect", 
								value: this.props.specialization.id, onChange: this.props.onSpecializationChange}, 
							specializationOptions
						)
					), 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "specializationSkillCheckbox"}, "Skills"), 
						React.createElement("div", {id: "specializationSkillCheckbox"}, 
							skillCheckBoxes
						)
					)
				), 
				React.createElement("div", {className: "panel-footer"}, 
					"Skills selected: ", count, " / ", total
				)

			)
		);
	}
});

var AdditionalSpecializations = React.createClass({displayName: "AdditionalSpecializations",
	render: function() {

		var selectedCareer = this.props.character.career.id;
		var selectedSpecialization = this.props.character.specialization.id;
		var specs = this.props.master.specializations;
		var addSpecs = this.props.character.additionalSpecializations;
		var onClick = this.props.onClick;

		var xpLeft = xpBudget(this.props.master, this.props.character) -
			xpSpent(this.props.master, this.props.character);

		var rows = this.props.master.careers.map(function(career, careerIndex) {

			var cells = career.specializations.map(function(specialization) {
				var selected = (addSpecs.indexOf(specialization) !== -1);
				var primarySpec = (specialization === selectedSpecialization);
				var careerSpec = (careerIndex === selectedCareer);
				var hasXp = (xpLeft >= (careerSpec ? (addSpecs.length + 1) * 10 : (addSpecs.length + 2) * 10))

				var style = "btn btn-block btn-sm" // "btn-default";
				if (selected || primarySpec ) {
					style += " active";
				}
				if (careerSpec) {
					style += " btn-primary";
				} else {
					style += " btn-default";
				}

				var disable = false;
				if (primarySpec || (!hasXp && !selected)) {
					disable = true;
				}

				return (
					React.createElement("div", {key: specialization, className: "col-sm-3"}, 
						React.createElement("button", {type: "button", value: specialization, className: style, disabled: disable, 
								onClick: onClick}, 
							specs[specialization].name
						)
					)
				);
			});

			return (
				React.createElement("div", {key: careerIndex, className: "row"}, 
					React.createElement("div", {className: "col-sm-3"}, career.name), 
					cells
				)
			);
		});

		return (
			React.createElement("div", {className: "panel panel-default"}, 
				React.createElement("div", {className: "panel-heading"}, 
					React.createElement("h3", {className: "panel-title"}, "Additional Specializations")
				), 
				React.createElement("div", {className: "panel-body"}, 
					rows
				), 
				React.createElement("div", {className: "panel-footer"}, 
					"XP: ", React.createElement(XP, {master: this.props.master, character: this.props.character})
				)
			)
		);
	}
});

var Characteristics = React.createClass({displayName: "Characteristics",
	render: function() {
		
		var dftChars = this.props.master.species[this.props.character.species].characteristics;
		var chars = this.props.character.characteristics;
		var onChange = this.props.onChange;

		var xpLeft = xpBudget(this.props.master, this.props.character) -
			xpSpent(this.props.master, this.props.character);

		var charInputs = this.props.master.characteristics.map(function(item, index) {
			var minValue = dftChars[index];
			var maxValue = maxChar(chars[index], xpLeft);
			
			return (
				React.createElement("div", {key: index, className: "col-sm-2"}, 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "char-" + index}, item.name, " ", React.createElement("small", null, "[", item.abbr, "]")), 
						React.createElement("input", {type: "number", className: "form-control input-lg", id: "char-" + index, defaultValue: minValue, 
								min: minValue, max: maxValue, value: chars[index], onChange: onChange})
					)
				)
			);
		});

		return (
			React.createElement("div", {className: "panel panel-default"}, 
				React.createElement("div", {className: "panel-heading"}, 
					React.createElement("h3", {className: "panel-title"}, "Characteristics")
				), 
				React.createElement("div", {className: "panel-body"}, 
					React.createElement("div", {className: "row"}, 
						charInputs
					)
				), 
				React.createElement("div", {className: "panel-footer"}, 
					"XP: ", React.createElement(XP, {master: this.props.master, character: this.props.character})
				)
			)
		);
	}
});

var Skills = React.createClass({displayName: "Skills",
	render: function() {
		var chars = this.props.characteristics;
		var COLS = 2;
		var width = 12 / COLS;
		var allSkills = [];
		for (var i = 0; i < COLS; i++) {
			var skills = this.props.skills.
				filter(function(item, index) { return (index % COLS === i); }).
				map(function(item, index) {
					return (
						React.createElement("tr", {key: index}, 
							React.createElement("td", null, item.name, " ", React.createElement("small", null, "[", chars[item.chr].abbr, "]"), " "), 
							React.createElement("td", null, 
								React.createElement("input", {type: "number", 
									className: "form-control input-sm input-sm", 
									id: 'skill-' + index, 
									min: "0", max: "5", defaultValue: "0"})
							), 
							React.createElement("td", null, " YGG ")
						)
					);
			});
			allSkills.push(
				React.createElement("div", {key: i, className: 'col-sm-' + width}, 
					React.createElement("table", {className: "table table-condensed form-horizontal"}, 
						React.createElement("thead", null, 
							React.createElement("tr", null, 
								React.createElement("th", null, "Skill ", React.createElement("small", null, "[Char.]"), " "), 
								React.createElement("th", null, "Value"), 
								React.createElement("th", null, "Roll")
							)
						), 
						React.createElement("tbody", null, 
							skills
						)
					)
				)
			);
		}
		return (
			React.createElement("div", {className: "panel panel-default"}, 
				React.createElement("div", {className: "panel-heading"}, 
					React.createElement("h3", {className: "panel-title"}, " Skills ")
				), 
				React.createElement("div", {className: "panel-body"}, 
					React.createElement("div", {className: "row"}, 
						allSkills
					)
				)
			)
		);
	}
});

var XP = React.createClass({displayName: "XP",
	render: function() {
		var xs = xpSpent(this.props.master, this.props.character);
		var xb = xpBudget(this.props.master, this.props.character);

		return (
			React.createElement("span", null, " ", xs, " / ", xb, " ")
		);
	}
});

// entry point

$.ajax({ url: "master.json", dataType: "json" })
	.done(function(master) {
		React.render( React.createElement(CharacterGenerator, {master: master}) , document.getElementById("characterGenerator"));
	})
	.fail(function(request, status, exception) {
		alert('Request for ' + this.url + ' failed with: ' + exception.toString());
	});

var Template = React.createClass({displayName: "Template",
	render: function() {
		return (
			''
		);
	}
});
