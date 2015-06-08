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

var CharacterGenerator = React.createClass({

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
				species: new Array(skillCount),
				career: new Array(skillCount),
				spec: new Array(skillCount),
				bought: new Array(skillCount)
			}
		};
		
		// species skills will be here
		
		this.props.master.careers[state.career].skills.forEach(function(item) {
			state.skills.career[item] = 0;
		});

		this.props.master.specializations[state.specialization].skills.forEach(function(item) {
			state.skills.spec[item] = 0;
		});

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

		var cs = [];
		this.props.master.careers[c].skills.forEach(function(item) {
			cs[item] = 0;
		});
		
		var ss = []
		this.props.master.specializations[sp].skills.forEach(function(item) {
			ss[item] = 0;
		});

		var addSpecs = this.state.additionalSpecializations;
		var i = addSpecs.indexOf(sp);
		if (i !== -1) {
			addSpecs = addSpecs.splice(i, 1);
		}

		addSpecs.forEach(function(spec) {
			this.props.master.specializations[spec].skills.forEach(function(skill) {
				ss[skill] = (ss[skill] || 0);
			}, this);
		}, this);

		var s = React.addons.update(this.state, {
			career: { $set: c},
			specialization: { $set: sp},
			additionalSpecializations: { $set: addSpecs},
			skills: {
				career: { $set: cs},
				spec: { $set: ss}
			}
		});

		this.setState(s);
	},

	onCareerSkillChange: function(event) {
		var skill = parseInt(event.target.value);
		var v = (this.state.skills.career[skill] === 1 ? 0 : 1);

		var s = React.addons.update(this.state, { skills: { career: { $splice: [[skill, 1, v]] }}});
		
		var total = (s.skills.species[skill] || 0) +
			(s.skills.career[skill] || 0) +
			(s.skills.spec[skill] || 0) +
			(s.skills.bought[skill] || 0);

		console.log(s.skills.species[skill] + ' + ' + s.skills.career[skill] + ' + ' +
			s.skills.spec[skill] + ' + ' + s.skills.bought[skill]  + ' = ' + total);

		if (total > 2) {
			v = s.skills.bought[skill] - Math.min((total - 2), (s.skills.bought[skill] || 0));
			s = React.addons.update(s, { skills: { bought: { $splice: [[skill, 1, v]] }}});
		}

		this.setState(s);
	},

	onSpecializationChange: function(event) {
		var sp = parseInt(event.target.value);

		var specSkills = []
		this.props.master.specializations[sp].skills.forEach(function(item) {
			specSkills[item] = 0;
		});

		var addSpecs = this.state.additionalSpecializations;
		var i = addSpecs.indexOf(sp);
		if (i !== -1) {
			addSpecs = addSpecs.splice(i, 1);
		}

		addSpecs.forEach(function(spec) {
			this.props.master.specializations[spec].skills.forEach(function(skill) {
				ss[skill] = (ss[skill] || 0);
			}, this);
		}, this);

		var s = React.addons.update(this.state, {
			specialization: { $set: sp},
			additionalSpecializations: { $set: addSpecs},
			skills: {spec: { $set: specSkills}}
		});

		this.setState(s);
	},

	onSpecSkillChange: function(event) {
		var skill = parseInt(event.target.value);
		var v = (this.state.skills.spec[skill] === 1 ? 0 : 1);
		var s = React.addons.update(this.state, { skills: { spec: { $splice: [[skill, 1, v]] }}});

		var total = (s.skills.species[skill] || 0) +
			(s.skills.career[skill] || 0) +
			(s.skills.spec[skill] || 0) +
			(s.skills.bought[skill] || 0);

		console.log(s.skills.species[skill] + ' + ' + s.skills.career[skill] + ' + ' +
			s.skills.spec[skill] + ' + ' + s.skills.bought[skill]  + ' = ' + total);

		if (total > 2) {
			v = s.skills.bought[skill] - Math.min((total - 2), (s.skills.bought[skill] || 0));
			s = React.addons.update(s, { skills: { bought: { $splice: [[skill, 1, v]] }}});
		}

		this.setState(s);
	},

	onAdditionalSpecializationClick: function(event) {
		var sp = parseInt(event.target.value);
		var i = this.state.additionalSpecializations.indexOf(sp);
		var ss = this.state.skills.spec.slice();

		if (i === -1) {
			this.props.master.specializations[sp].skills.forEach(function(skill) {
				ss[skill] = (ss[skill] || 0);
			}, this);

			var s = React.addons.update(this.state, {
				additionalSpecializations: { $push: [sp] },
				skills: { spec: { $set: ss }}
			});

		} else {
			var s = React.addons.update(this.state, { additionalSpecializations: { $splice: [[i, 1]] }});

			// build the valid spec skill list
			var except = [];
			this.props.master.specializations[s.specialization].skills.forEach(function(skill) {
				if (except.indexOf(skill) === -1) {
					except.push(skill);
				}
			});
			s.additionalSpecializations.forEach(function(spec) {
				this.props.master.specializations[spec].skills.forEach(function(skill) {
					if (except.indexOf(skill) === -1) {
						except.push(skill);
					}
				}, this);
			}, this);

			// remove spec skills not in the list
			ss.forEach(function(item, index) {
				if (except.indexOf(index) === -1) {
					delete ss[index];
				}
			});

			s = React.addons.update(s, { skills: { spec: { $set: ss }}});
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
				<option key={index} value={index}>{item.name}</option>
			);
		});

		return (
			<form>
				<div className="row">
					<div className="col-xs-10 col-xs-offset-1">
						<div className="row navigator" id="general">
							<div className="col-xs-12">
								<div className="panel panel-default">
									<div className="panel-heading">
										<h3 className="panel-title">General information</h3>
									</div>
									<div className="panel-body">
										<div className="row">
											<div className="col-sm-6">
												<div className="form-group">
													<label htmlFor="nameInput">Name</label>
													<input type="text" className="form-control input-sm" id="nameInput" placeholder="name your character"
															value={this.state.name} onChange={this.onNameChange}/>
												</div>
											</div>
											<div className="col-sm-6">
												<div className="form-group">
													<label htmlFor="xp">XP:</label>
													<div id="xp">
														<XP master={this.props.master} character={this.state} />
													</div>
												</div>
											</div>
										</div>
										<div className="row">
											<div className="col-sm-6">
												<div className="form-group">
													<label htmlFor="speciesSelect">Species</label>
													<select className="form-control input-sm" id="speciesSelect"
															value={this.state.species} onChange={this.onSpeciesChange}>
														{speciesOptions}
													</select>
												</div>
											</div>
											<div className="col-sm-6">
												<div className="form-group">
													<label htmlFor="creditsPar">Credits:</label>
													<p id="creditsPar" className="form-control-static"> 5000 Cr </p>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="row">
							<div className="col-xs-12">
								<Obligation
										master={this.props.master}
										obligation={this.state.obligation}
										onTypeChange={this.onObligationTypeChange}
										onValueChange={this.onObligationValueChange}
										onAdditionalChange={this.onAdditionalObligationChange} />
							</div>
						</div>
						<div className="row">
							<div className="col-sm-6">
								<Career
										master={this.props.master}
										career={this.state.career}
										careerSkills={this.state.skills.career}
										onCareerChange={this.onCareerChange}
										onCareerSkillChange={this.onCareerSkillChange} />
							</div>
							<div className="col-sm-6">
								<Specialization
										master={this.props.master}
										career={this.state.career}
										specialization={this.state.specialization}
										specSkills={this.state.skills.spec}
										onSpecializationChange={this.onSpecializationChange}
										onSpecSkillChange={this.onSpecSkillChange} />
							</div>
						</div>
						<div className="row">
							<div className="col-xs-12">
								<AdditionalSpecializations
										master={this.props.master}
										character={this.state}
										onClick={this.onAdditionalSpecializationClick} />
							</div>
						</div>
						<div className="row navigator" id="characteristics">
							<div className="col-xs-12">
								<Characteristics
										master={this.props.master}
										character={this.state}
										onChange={this.onCharacteristicChange} />
							</div>
						</div>
						<div className="row navigator" id="skills">
							<div className="col-xs-12">
								<Skills
										master={this.props.master}
										character={this.state}
										onChange={this.onSkillChange} />
							</div>
						</div>
						<div className="row navigator" id="talents">
							<div className="col-xs-12">
								<div className="panel panel-default">
									<div className="panel-heading">
										<h3 className="panel-title"> Talents </h3>
									</div>
									<div className="panel-body">
										<em>Coming soon!</em>
									</div>
								</div>
							</div>
						</div>
						<div className="row navigator" id="equipment">
							<div className="col-xs-12">
								<div className="panel panel-default">
									<div className="panel-heading">
										<h3 className="panel-title"> Equipment </h3>
									</div>
									<div className="panel-body">
										<em>Coming soon!</em>
									</div>
								</div>
							</div>
						</div>
						
					</div>
				</div>
			</form>
		);
	}
});

var Obligation = React.createClass({
	render: function() {

		var typeOptions = this.props.master.obligations.map(function(item, index) {
			return (
				<option key={index} value={index}>{item.name}</option>
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
				<div key={index} className={disable ? "checkbox disabled" : "checkbox"}>
					<label>
						<input type="checkbox" value={index} checked={addStatus} disabled={disable}
							onChange={this.props.onAdditionalChange} />
						{item.name}
					</label>
				</div>
			);
		}, this);

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Obligation</h3>
				</div>
				<div className="panel-body">
					<div className="col-sm-6">
						<div className="form-group">
							<label htmlFor="obligationTypeSelect">Type</label>
							<select className="form-control input-sm" id="obligationTypeSelect"
								value={this.props.obligation.type} onChange={this.props.onTypeChange}>
								{typeOptions}
							</select>
						</div>
						<div className="form-group">
							<label htmlFor="obligationSizeSelect">Starting Value</label>
							<select className="form-control input-sm" id="speciesSelect"
								value={this.props.obligation.value} onChange={this.props.onValueChange}>
								<option value="20">20 (2 players)</option>
								<option value="15">15 (3 players)</option>
								<option value="10">10 (4-5 players)</option>
								<option value="5" >5  (6+ players)</option>
							</select>
						</div>
					</div>
					<div className="col-sm-6">
						<div className="form-group">
							<label htmlFor="additionalObligationCheckbox">Additional Obligation</label>
							<div id="additionalObligationCheckboxes">
								{checkBoxes}
							</div>
						</div>
					</div>
				</div>
				<div className="panel-footer">
					Total obligation: {(this.props.obligation.value + totalAdditional)}
				</div>
			</div>
		);
	}
});

var Career = React.createClass({
	render: function() {

		var careerOptions = this.props.master.careers.map(function(item, index) {
			return (
				<option key={index} value={index}>{item.name}</option>
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
				<div key={item} className={disable ? "checkbox disabled" : "checkbox"}>
					<label>
						<input type="checkbox" value={item}
								checked={status} disabled={disable}
								onChange={this.props.onCareerSkillChange}/>
						{this.props.master.skills[item].name}
					</label>
				</div>
			);
		}, this);

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Career</h3>
				</div>
				<div className="panel-body">
					<div className="form-group">
						<label htmlFor="CareerSelect">Name</label>
						<select className="form-control input-sm" id="CareerSelect"
								value={this.props.career} onChange={this.props.onCareerChange}>
							{careerOptions}
						</select>
					</div>
					<div className="form-group">
						<label htmlFor="careerSkillCheckbox">Skills</label>
						<div id="careerSkillCheckbox">
							{skillCheckBoxes}
						</div>
					</div>
				</div>
				<div className="panel-footer">
					Skills selected: {count} / {total}
				</div>
			</div>
		);
	}
});

var Specialization = React.createClass({
	render: function() {
		
		var specializationOptions	= this.props.master.careers[this.props.career].specializations.map(function(item) {
			return (
				<option key={item} value={item}>{this.props.master.specializations[item].name}</option>
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
				<div key={item} className={disable ? "checkbox disabled" : "checkbox"}>
					<label>
						<input type="checkbox" value={item}
								checked={status} disabled={disable}
								onChange={this.props.onSpecSkillChange} />
						{this.props.master.skills[item].name}
					</label>
				</div>
			);
		}, this);

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Specialization</h3>
				</div>
				<div className="panel-body">
					<div className="form-group">
						<label htmlFor="SpecializationSelect">Name</label>
						<select className="form-control input-sm" id="SpecializationSelect"
								value={this.props.specialization} onChange={this.props.onSpecializationChange}>
							{specializationOptions}
						</select>
					</div>
					<div className="form-group">
						<label htmlFor="specializationSkillCheckbox">Skills</label>
						<div id="specializationSkillCheckbox">
							{skillCheckBoxes}
						</div>
					</div>
				</div>
				<div className="panel-footer">
					Skills selected: {count} / {total}
				</div>

			</div>
		);
	}
});

var AdditionalSpecializations = React.createClass({
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
					<div key={specialization} className="col-sm-3">
						<button type="button" className={style} disabled={disable}
								value={specialization}  onClick={this.props.onClick}>
							{this.props.master.specializations[specialization].name}
						</button>
					</div>
				);
			}, this);

			return (
				<div key={careerIndex} className="row">
					<div className="col-sm-3">{career.name}</div>
					{cells}
				</div>
			);
		}, this);

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Additional Specializations</h3>
				</div>
				<div className="panel-body">
					{rows}
				</div>
				<div className="panel-footer">
					XP: <XP master={this.props.master} character={this.props.character} />
				</div>
			</div>
		);
	}
});

var Characteristics = React.createClass({
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
				<div key={index} className="col-sm-2">
					<div className="form-group">
						<label>{item.name} <small>[{item.abbr}]</small></label>
						<input type="number" className="form-control input-lg" id={index}  defaultValue={minValue}
								min={minValue} max={maxValue} value={chars[index]} onChange={onChange} />
					</div>
				</div>
			);
		});

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Characteristics</h3>
				</div>
				<div className="panel-body">
					<div className="row">
						{charInputs}
					</div>
				</div>
				<div className="panel-footer">
					XP: <XP master={this.props.master} character={this.props.character} />
				</div>
			</div>
		);
	}
});

var Skills = React.createClass({
	render: function() {

		var COLS = 2;

		var width = 12 / COLS;
		var skills = this.props.master.skills;
		var chars = this.props.master.characteristics;
		var charSkills = this.props.character.skills;
		
		var xpLeft = xpBudget(this.props.master, this.props.character) -
			xpSpent(this.props.master, this.props.character);

		var rows = [];
		for (var i = 0; i < COLS; i++) { rows[i]=[]; }

		this.props.master.skills.map(function(item, index) {
			
			var minValue = (charSkills.species[index] || 0) +
				(charSkills.career[index] || 0) +
				(charSkills.spec[index] || 0);
			var value = minValue + (charSkills.bought[index] || 0);
			var isCareer = (charSkills.career[index] !== undefined) || (charSkills.spec[index] !== undefined);
			var maxValue = Math.min(maxSkill(value, xpLeft, isCareer), 2);

			var characteristic = this.props.character.characteristics[item.chr];
			var yellow = Math.min(value, characteristic);
			var green = Math.max(value, characteristic) - yellow;
			var dice = '\u25A0';

			rows[(index % COLS)].push(
				<tr key={index} className={(isCareer ? 'info' : '')}>
					<td>{item.name} <small>[{chars[item.chr].abbr}]</small></td>
					<td>
						<input type="number"
								className="form-control input-sm input-sm"
								id={index} min={minValue} max={maxValue}
								value={value} onChange={this.props.onChange} />
					</td>
					<td>
						<span style={{fontSize: 'large'}}>
							<span style={{color: 'yellow'}}>{dice.repeat(yellow)}</span>
							<span style={{color: 'green'}}>{dice.repeat(green)}</span>
						</span>
					</td>
				</tr>
			);
		}, this);

		var columns = rows.map(function(item, index) {
			return (
				<div key={index} className={'col-sm-' + width}>
					<table className="table table-condensed form-horizontal">
						<thead>
							<tr>
								<th className="col-sm-6">Skill <small>[Char.]</small> </th>
								<th className="col-sm-3">Value</th>
								<th className="col-sm-3">Roll</th>
							</tr>
						</thead>
						<tbody>
							{item}
						</tbody>
					</table>
				</div>
			);
		}, this);

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title"> Skills </h3>
				</div>
				<div className="panel-body">
					<div className="row">
						{columns}
					</div>
				</div>
				<div className="panel-footer">
					XP: <XP master={this.props.master} character={this.props.character} />
				</div>
			</div>
		);
	}
});

var XP = React.createClass({
	render: function() {
		var xs = xpSpent(this.props.master, this.props.character);
		var xb = xpBudget(this.props.master, this.props.character);

		return (
			<span> {xs} / {xb} </span>
		);
	}
});

// entry point

$.ajax({ url: "master.json", dataType: "json" })
	.done(function(master) {
		React.render( <CharacterGenerator master={master} /> , document.getElementById("characterGenerator"));
	})
	.fail(function(request, status, exception) {
		alert('Request for ' + this.url + ' failed with: ' + exception.toString());
	});

var Template = React.createClass({
	render: function() {
		return (
			''
		);
	}
});
