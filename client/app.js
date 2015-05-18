'use strict'

var CharacterGenerator = React.createClass({displayName: "CharacterGenerator",

	getInitialState: function() {
		return {
			name: '',
			species: 3,
			obligation: {
				type: 3,
				value: 10,
				additional: [false, false, false, false]
			}
		};
	},

	onNameChange: function(event) {
		this.setState({ name: event.target.value });
	},

	onSpeciesChange: function(event) {
		this.setState({ species: event.target.value });
	},

	onObligationTypeChange: function(event) {
		var t = event.target.value;
		var s = React.addons.update(this.state, { obligation: { type: { $set: t }}});
		this.setState(s);
	},

	onObligationValueChange: function(event) {
		var v = event.target.value;
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
										React.createElement("div", {className: "form-group"}, 
											React.createElement("label", {htmlFor: "nameInput"}, "Name"), 
											React.createElement("input", {type: "text", className: "form-control input-sm", id: "nameInput", placeholder: "name your character", 
													value: this.state.name, onChange: this.onNameChange})
										), 
										React.createElement("div", {className: "form-group"}, 
											React.createElement("label", {htmlFor: "speciesSelect"}, "Species"), 
											React.createElement("select", {className: "form-control input-sm", id: "speciesSelect", 
													value: this.state.species, onChange: this.onSpeciesChange}, 
												speciesOptions
											)
										)
									)
								)
							)
						), 
						React.createElement("div", {className: "row"}, 
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement(Obligation, {
									obligations: this.props.master.obligations, 
									additionalObligations: this.props.master.additionalObligations, 
									obligation: this.state.obligation, 
									onTypeChange: this.onObligationTypeChange, 
									onValueChange: this.onObligationValueChange, 
									onAdditionalChange: this.onAdditionalObligationChange}), 
								React.createElement("div", null, this.state.obligation.type, " ", this.state.obligation.value, " ", JSON.stringify(this.state.obligation.additional))
							)
						), 
						React.createElement("div", {className: "row"}, 
							React.createElement("div", {className: "col-sm-6"}, 
								React.createElement(Career, {
									careers: this.props.master.careers, 
									skills: this.props.master.skills})
							), 
							React.createElement("div", {className: "col-sm-6"}, 
								React.createElement(Specialization, {
									careers: this.props.master.careers, 
									skills: this.props.master.skills})
							)
						), 
						React.createElement("div", {className: "row"}, 
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement(AdditionalSpecializations, {
									careers: this.props.master.careers})
							)
						), 
						React.createElement("div", {className: "row navigator", id: "characteristics"}, 
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement(Characteristics, {characteristics: this.props.master.characteristics})
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

		var typeOptions = this.props.obligations.map(function (item, index) {
			return (
				React.createElement("option", {key: index, value: index}, item.name)
			);
		});

		var addObligations = this.props.additionalObligations;
		var totalAdditional = this.props.obligation.additional.reduce(function(prev, curr, index) {
			return (prev + (curr ? addObligations[index].obligation : 0));
		});

		var checkBoxes = addObligations.map(function (item, index) {
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
				)
			)
		);
	}
});

var Career = React.createClass({displayName: "Career",
	render: function() {

		// this points to something else inside the map function,
		// so we create an alternate name for the stuff we use
		var skills = this.props.skills;
		//TODO selected career
		var selectedCareer = this.props.careers[0];
		
		var careerOptions = this.props.careers.map(function(item, index) {
			return (
				React.createElement("option", {key: index}, item.name)
			);
		});

		var skillCheckBoxes = selectedCareer.skills.map(function (item, index) {
			return (
				React.createElement("div", {key: index, className: "checkbox"}, 
					React.createElement("label", null, 
						React.createElement("input", {type: "checkbox", value: index}), skills[item].name)
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
						React.createElement("select", {className: "form-control input-sm", id: "CareerSelect"}, 
							careerOptions
						)
					), 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "careerSkillCheckbox"}, "Skills"), 
						React.createElement("div", {id: "careerSkillCheckbox"}, 
							skillCheckBoxes
						)
					)
				)
			)
		);
	}
});

var Specialization = React.createClass({displayName: "Specialization",
	render: function() {
		// this points to something else inside the map function,
		// so we create an alternate name for the stuff we use
		var skills = this.props.skills;
		//TODO: selected career
		var selectedCareer = this.props.careers[0];
		//TODO: selected specialization
		var selectedSpecialization = this.props.careers[0].specializations[0];

		var specializationOptions = selectedCareer.specializations.map(function(item, index) {
			return (
				React.createElement("option", {key: index}, item.name)
			);
		});

		var skillCheckBoxes = selectedSpecialization.skills.map(function(item, index) {
			return (
				React.createElement("div", {key: index, className: "checkbox"}, 
					React.createElement("label", null, 
						React.createElement("input", {type: "checkbox", value: index}), skills[item].name)
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
						React.createElement("select", {className: "form-control input-sm", id: "SpecializationSelect"}, 
							specializationOptions
						)
					), 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "specializationSkillCheckbox"}, "Skills"), 
						React.createElement("div", {id: "specializationSkillCheckbox"}, 
							skillCheckBoxes
						)
					)
				)
			)
		);
	}
});

var AdditionalSpecCheckBox =  React.createClass({displayName: "AdditionalSpecCheckBox",
	render: function() {
		var spec = this.props.specialization;
		var index = this.props.specializationIndex;
		
	}
});

var AdditionalSpecializations = React.createClass({displayName: "AdditionalSpecializations",
	render: function() {
		//TODO: selected career
		var selectedCareerIndex = 2;
		//TODO: selected specialization
		var selectedSpecializationIndex = 1;

		var rows = this.props.careers.map(function(career, careerIndex) {

			var cells = career.specializations.map(function(specialization, specIndex) {
				var style = "col-sm-4";
				var disabled = false;
				if (careerIndex === selectedCareerIndex && specIndex === selectedSpecializationIndex) {
					style = "col-sm-4 bg-primary";
					disabled = true;
				} else if (careerIndex === selectedCareerIndex) {
					style = "col-sm-4 bg-info";
					disabled = false;
				}
				return (
					React.createElement("div", {key: specIndex, className: style}, 
						React.createElement("div", {className: "checkBox"}, 
							React.createElement("label", {className: "control-label"}, 
								React.createElement("input", {type: "checkbox", value: specIndex, disabled: disabled}), specialization.name)
						)
					)
				);
			});

			return (
				React.createElement("div", {key: careerIndex, className: "row"}, 
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
				)
			)
		);
	}
});

var Characteristics = React.createClass({displayName: "Characteristics",
	render: function() {
		return (
			React.createElement("div", {className: "panel panel-default"}, 
				React.createElement("div", {className: "panel-heading"}, 
					React.createElement("h3", {className: "panel-title"}, "Characteristics")
				), 
				React.createElement("div", {className: "panel-body"}, 
					React.createElement("div", {className: "row"}, 
						React.createElement("div", {className: "col-sm-4"}, 
							React.createElement(CharacteristicInput, {characteristic: this.props.characteristics[0]})
						), 
						React.createElement("div", {className: "col-sm-4"}, 
							React.createElement(CharacteristicInput, {characteristic: this.props.characteristics[1]})
						), 
						React.createElement("div", {className: "col-sm-4"}, 
							React.createElement(CharacteristicInput, {characteristic: this.props.characteristics[2]})
						)
					), 
					React.createElement("div", {className: "row"}, 
						React.createElement("div", {className: "col-sm-4"}, 
							React.createElement(CharacteristicInput, {characteristic: this.props.characteristics[3]})
						), 
						React.createElement("div", {className: "col-sm-4"}, 
							React.createElement(CharacteristicInput, {characteristic: this.props.characteristics[4]})
						), 
						React.createElement("div", {className: "col-sm-4"}, 
							React.createElement(CharacteristicInput, {characteristic: this.props.characteristics[5]})
						)
					)
				)
			)
		);
	}
});

var CharacteristicInput = React.createClass({displayName: "CharacteristicInput",
	render: function() {
		var chr = this.props.characteristic;
		return (
			React.createElement("div", {className: "form-group"}, 
				React.createElement("label", {htmlFor: "{chr.abbr}"}, chr.name, " ", React.createElement("small", null, "[", chr.abbr, "]")), 
				React.createElement("input", {type: "number", className: "form-control input-sm", id: "{chr.abbr}", min: "2", max: "5", defaultValue: "2"})
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


// entry point

$.ajax({ url: "master.json", dataType: "json" })
	.done(function(master) {
		React.render(
			React.createElement(CharacterGenerator, {master: master}),
			document.getElementById('characterGenerator')
		);

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
