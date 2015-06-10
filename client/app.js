'use strict'

///////////////
//  helpers  //
///////////////

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
		var career = character.career;
		var x = character.additionalSpecializations.reduce(function(prev, item, index) {
			return prev + ((specs[item].career === career) ? (index + 1) * 10 : (index + 2) * 10);
		}, 0);

		var startChars = master.species[character.species].characteristics;
		var chars = character.characteristics;
		x += chars.reduce(function(prev, item, index) {
			return (prev + (CHAR_PRICES[item] - CHAR_PRICES[startChars[index]]));
		}, 0);
		

		x += master.skills.reduce(function(prev, item, index) {
			var freeRank = (character.skills.species[index] || 0) +
				(character.skills.career[index] || 0) +
				(character.skills.spec[index] || 0);
			var boughtRank = freeRank + (character.skills.bought[index] || 0);
			var isCareer = (character.skills.career[index] !== undefined) || (character.skills.spec[index] !== undefined);

			return prev + skillCost(boughtRank, isCareer) - skillCost(freeRank, isCareer);
		}, 0);
		
		return x;
}

var CHAR_PRICES = [0, 10, 30, 60, 100, 150];
function maxChar(current, xp) {
	var budget = CHAR_PRICES[current] + xp;
	var r = current;
	while (CHAR_PRICES[r] <= budget) { r++; }
	return (r - 1);
}

function skillCost(rank, isCareer) {
	var result = 0;
	for (var i = 1; i <= rank; i++) {
		result += i * 5 + (isCareer ? 0 : 5)
	}
	return result;
}

function maxSkill(current, xp, isCareer) {
	var budget = skillCost(current,  isCareer) + xp;
	var r = current;

	while (skillCost(r, isCareer) <= budget) { r++; }
	return (r - 1);

}

/////////////////////
//  React classes  //
/////////////////////

var CharacterGenerator = React.createClass({displayName: "CharacterGenerator",

	getInitialState: function() {
		var skillCount = this.props.master.skills.length;
		var state = {
			name: '',
			species: 3,
			obligation: {
				type: 3,
				value: 10,
				additional: [false, false, false, false]
			},
			career: 4,
			specialization:12,
			additionalSpecializations: [],
			characteristics: [2, 2, 2, 2, 2, 2],
			skills: {
				species: [],
				career: [],
				spec: [],
				bought: []
			}
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

		var addSpecs = this.state.additionalSpecializations;
		var i = addSpecs.indexOf(sp);
		if (i !== -1) {
			addSpecs = addSpecs.splice(i, 1);
		}

		var s = React.addons.update(this.state, {
			career: { $set: c},
			specialization: { $set: sp},
			additionalSpecializations: { $set: addSpecs},
			skills: {
				career: { $set: [] },
				spec: { $set: [] }
			}
		});

		this.setState(s);
	},

	onCareerSkillChange: function(event) {
		var skill = parseInt(event.target.value);
		if (this.state.skills.career[skill] === 1) {
			var s = React.addons.update(this.state, { skills: { career: { $splice: [[skill, 1]] }}});
		} else {
			var s = React.addons.update(this.state, { skills: { career: { $splice: [[skill, 1, 1]] }}});
		}
		
		var total = (s.skills.species[skill] || 0) +
			(s.skills.career[skill] || 0) +
			(s.skills.spec[skill] || 0) +
			(s.skills.bought[skill] || 0);

		if (total > 2) {
			var v = s.skills.bought[skill] - Math.min((total - 2), (s.skills.bought[skill] || 0));
			s = React.addons.update(s, { skills: { bought: { $splice: [[skill, 1, v]] }}});
		}

		this.setState(s);
	},

	onSpecializationChange: function(event) {
		var sp = parseInt(event.target.value);

		var addSpecs = this.state.additionalSpecializations;
		var i = addSpecs.indexOf(sp);
		if (i !== -1) {
			addSpecs = addSpecs.splice(i, 1);
		}

		var s = React.addons.update(this.state, {
			specialization: { $set: sp},
			additionalSpecializations: { $set: addSpecs},
			skills: {spec: { $set: [] }}
		});

		this.setState(s);
	},

	onSpecSkillChange: function(event) {
		var skill = parseInt(event.target.value);
		if (this.state.skills.spec[skill] === 1) {
			var s = React.addons.update(this.state, { skills: { spec: { $splice: [[skill, 1]] }}});
		} else {
			var s = React.addons.update(this.state, { skills: { spec: { $splice: [[skill, 1, 1]] }}});
		}

		var total = (s.skills.species[skill] || 0) +
			(s.skills.career[skill] || 0) +
			(s.skills.spec[skill] || 0) +
			(s.skills.bought[skill] || 0);

		if (total > 2) {
			v = s.skills.bought[skill] - Math.min((total - 2), (s.skills.bought[skill] || 0));
			s = React.addons.update(s, { skills: { bought: { $splice: [[skill, 1, v]] }}});
		}

		this.setState(s);
	},

	onAdditionalSpecializationClick: function(event) {
		var sp = parseInt(event.target.value);
		var i = this.state.additionalSpecializations.indexOf(sp);

		if (i === -1) {
			var s = React.addons.update(this.state, { additionalSpecializations: { $push: [sp] }});
		} else {
			var s = React.addons.update(this.state, { additionalSpecializations: { $splice: [[i, 1]] }});
		}
		
		this.setState(s);
	},

	onCharacteristicChange: function(event) {
		var i = parseInt(event.target.id);
		var v = parseInt(event.target.value);
		var min = parseInt(event.target.min);
		var max = parseInt(event.target.max);

		if (isNaN(v) || v > max || v < min) {
			return false;
		}

		var s = React.addons.update(this.state, { characteristics: { $splice: [[i, 1, v]] }});

		this.setState(s);
	},

	onSkillChange: function(event) {
		var i = parseInt(event.target.id);
		var total = parseInt(event.target.value);
		var min = parseInt(event.target.min);
		var max = parseInt(event.target.max);

		if (isNaN(total) || total > max || total < min) {
			return false;
		}
		var skills = this.state.skills;
		var v = total - (skills.species[i] || 0) - (skills.career[i] || 0) - (skills.spec[i] || 0);
		var s = React.addons.update(this.state, { skills: { bought: { $splice: [[i, 1, v]] }}});

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
										careerSkills: this.state.skills.career, 
										onCareerChange: this.onCareerChange, 
										onCareerSkillChange: this.onCareerSkillChange})
							), 
							React.createElement("div", {className: "col-sm-6"}, 
								React.createElement(Specialization, {
										master: this.props.master, 
										career: this.state.career, 
										specialization: this.state.specialization, 
										specSkills: this.state.skills.spec, 
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
								React.createElement(Skills, {
										master: this.props.master, 
										character: this.state, 
										onChange: this.onSkillChange})
							)
						), 
						React.createElement("div", {className: "row navigator", id: "talents"}, 
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement("div", {className: "panel panel-default"}, 
									React.createElement("div", {className: "panel-heading"}, 
										React.createElement("h3", {className: "panel-title"}, " Talents ")
									), 
									React.createElement("div", {className: "panel-body"}, 
										React.createElement("em", null, "Coming soon!")
									)
								)
							)
						), 
						React.createElement("div", {className: "row navigator", id: "equipment"}, 
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement("div", {className: "panel panel-default"}, 
									React.createElement("div", {className: "panel-heading"}, 
										React.createElement("h3", {className: "panel-title"}, " Equipment ")
									), 
									React.createElement("div", {className: "panel-body"}, 
										React.createElement("em", null, "Coming soon!")
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

		var count = this.props.careerSkills.reduce(function(prev, item) {
			return prev + item;
		}, 0);
		var total = 4;
		
		var selectedCareer = this.props.master.careers[this.props.career];
		var skillCheckBoxes = selectedCareer.skills.map(function(item) {
			var status = (this.props.careerSkills[item] === 1);
			var disable = !status && (count === total);

			return (
				React.createElement("div", {key: item, className: disable ? "checkbox disabled" : "checkbox"}, 
					React.createElement("label", null, 
						React.createElement("input", {type: "checkbox", value: item, 
								checked: status, disabled: disable, 
								onChange: this.props.onCareerSkillChange}), 
						this.props.master.skills[item].name
					)
				)
			);
		}, this);

		return (
			React.createElement("div", {className: "panel panel-default"}, 
				React.createElement("div", {className: "panel-heading"}, 
					React.createElement("h3", {className: "panel-title"}, "Career")
				), 
				React.createElement("div", {className: "panel-body"}, 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "CareerSelect"}, "Name"), 
						React.createElement("select", {className: "form-control input-sm", id: "CareerSelect", 
								value: this.props.career, onChange: this.props.onCareerChange}, 
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
		
		var specializationOptions	= this.props.master.careers[this.props.career].specializations.map(function(item) {
			return (
				React.createElement("option", {key: item, value: item}, this.props.master.specializations[item].name)
			);
		}, this);

		
		var count = this.props.specSkills.reduce(function(prev, item) {
			return prev + item;
		}, 0);
		var total = 2;

		var selectedSpecialization = this.props.master.specializations[this.props.specialization];
		var skillCheckBoxes = selectedSpecialization.skills.map(function(item) {
			var status = (this.props.specSkills[item] === 1);
			var disable = !status && (count === total);

			return (
				React.createElement("div", {key: item, className: disable ? "checkbox disabled" : "checkbox"}, 
					React.createElement("label", null, 
						React.createElement("input", {type: "checkbox", value: item, 
								checked: status, disabled: disable, 
								onChange: this.props.onSpecSkillChange}), 
						this.props.master.skills[item].name
					)
				)
			);
		}, this);

		return (
			React.createElement("div", {className: "panel panel-default"}, 
				React.createElement("div", {className: "panel-heading"}, 
					React.createElement("h3", {className: "panel-title"}, "Specialization")
				), 
				React.createElement("div", {className: "panel-body"}, 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "SpecializationSelect"}, "Name"), 
						React.createElement("select", {className: "form-control input-sm", id: "SpecializationSelect", 
								value: this.props.specialization, onChange: this.props.onSpecializationChange}, 
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

		var selectedCareer = this.props.character.career;
		var selectedSpecialization = this.props.character.specialization;
		var addSpecs = this.props.character.additionalSpecializations;

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
						React.createElement("button", {type: "button", className: style, disabled: disable, 
								value: specialization, onClick: this.props.onClick}, 
							this.props.master.specializations[specialization].name
						)
					)
				);
			}, this);

			return (
				React.createElement("div", {key: careerIndex, className: "row"}, 
					React.createElement("div", {className: "col-sm-3"}, career.name), 
					cells
				)
			);
		}, this);

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
						React.createElement("label", null, item.name, " ", React.createElement("small", null, "[", item.abbr, "]")), 
						React.createElement("input", {type: "number", className: "form-control input-lg", id: index, defaultValue: minValue, 
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

		var COLS = 2;

		var width = 12 / COLS;
		var charSkills = this.props.character.skills;
		
		var xpLeft = xpBudget(this.props.master, this.props.character) -
			xpSpent(this.props.master, this.props.character);

		var rows = [];
		for (var i = 0; i < COLS; i++) {
			rows[i]=[];
		}

		var careerSkills = this.props.master.careers[this.props.character.career].skills.concat(
			this.props.master.specializations[this.props.character.specialization].skills);
		careerSkills = careerSkills.concat.apply(careerSkills,
			this.props.character.additionalSpecializations.map(function(item, index) {
				return this.props.specializations[item].skills;
			}, this));
		console.log(JSON.stringify(careerSkills));

		this.props.master.skills.map(function(item, index) {
			
			var minValue = (charSkills.species[index] || 0) +
				(charSkills.career[index] || 0) +
				(charSkills.spec[index] || 0);
			var value = minValue + (charSkills.bought[index] || 0);
			var isCareer = (careerSkills.indexOf(index) !== -1);
			var maxValue = Math.min(maxSkill(value, xpLeft, isCareer), 2);

			var characteristic = this.props.character.characteristics[item.chr];
			var yellow = Math.min(value, characteristic);
			var green = Math.max(value, characteristic) - yellow;
			var dice = '\u25A0';

			rows[(index % COLS)].push(
				React.createElement("tr", {key: index, className: (isCareer ? 'info' : '')}, 
					React.createElement("td", null, item.name, " ", React.createElement("small", null, "[", characteristic.abbr, "]")), 
					React.createElement("td", null, 
						React.createElement("input", {type: "number", 
								className: "form-control input-sm input-sm", 
								id: index, min: minValue, max: maxValue, 
								value: value, onChange: this.props.onChange})
					), 
					React.createElement("td", null, 
						React.createElement("span", {style: {fontSize: 'large'}}, 
							React.createElement("span", {style: {color: 'yellow'}}, dice.repeat(yellow)), 
							React.createElement("span", {style: {color: 'green'}}, dice.repeat(green))
						)
					)
				)
			);
		}, this);

		var columns = rows.map(function(item, index) {
			return (
				React.createElement("div", {key: index, className: 'col-sm-' + width}, 
					React.createElement("table", {className: "table table-condensed form-horizontal"}, 
						React.createElement("thead", null, 
							React.createElement("tr", null, 
								React.createElement("th", {className: "col-sm-6"}, "Skill ", React.createElement("small", null, "[Char.]"), " "), 
								React.createElement("th", {className: "col-sm-3"}, "Value"), 
								React.createElement("th", {className: "col-sm-3"}, "Roll")
							)
						), 
						React.createElement("tbody", null, 
							item
						)
					)
				)
			);
		}, this);

		return (
			React.createElement("div", {className: "panel panel-default"}, 
				React.createElement("div", {className: "panel-heading"}, 
					React.createElement("h3", {className: "panel-title"}, " Skills ")
				), 
				React.createElement("div", {className: "panel-body"}, 
					React.createElement("div", {className: "row"}, 
						columns
					)
				), 
				React.createElement("div", {className: "panel-footer"}, 
					"XP: ", React.createElement(XP, {master: this.props.master, character: this.props.character})
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
