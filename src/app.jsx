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

var CharacterGenerator = React.createClass({

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
										onCareerChange={this.onCareerChange}
										onCareerSkillChange={this.onCareerSkillChange} />
							</div>
							<div className="col-sm-6">
								<Specialization
										master={this.props.master}
										careerId={this.state.career.id}
										specialization={this.state.specialization}
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
								<Skills skills={this.props.master.skills}
									characteristics={this.props.master.characteristics} />
							</div>
						</div>
						<div className="row navigator" id="equipment">
							<div className="col-xs-12">
								<div className="panel panel-default">
									<div className="panel-heading">
										<h3 className="panel-title"> Equipment </h3>
									</div>
									<div className="panel-body">
										Equipment
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
				<div key={item} className={disable ? "checkbox disabled" : "checkbox"}>
					<label>
						<input type="checkbox" value={item}
								checked={status} disabled={disable}
								onChange={onChange}/>
						{skillList[item].name}
					</label>
				</div>
			);
		});

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Career</h3>
				</div>
				<div className="panel-body">
					<div className="form-group">
						<label htmlFor="CareerSelect">Name</label>
						<select className="form-control input-sm" id="CareerSelect"
								value={this.props.career.id} onChange={this.props.onCareerChange}>
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
		var selectedCareer = this.props.master.careers[this.props.careerId];
		var specs = this.props.master.specializations;

		var specializationOptions	= selectedCareer.specializations.map(function(item) {
			return (
				<option key={item} value={item}>{specs[item].name}</option>
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
				<div key={item} className={disable ? "checkbox disabled" : "checkbox"}>
					<label>
						<input type="checkbox" value={item}
								checked={status} disabled={disable}
								onChange={onChange} />
						{skillList[item].name}
					</label>
				</div>
			);
		});

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Specialization</h3>
				</div>
				<div className="panel-body">
					<div className="form-group">
						<label htmlFor="SpecializationSelect">Name</label>
						<select className="form-control input-sm" id="SpecializationSelect"
								value={this.props.specialization.id} onChange={this.props.onSpecializationChange}>
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
					<div key={specialization} className="col-sm-3">
						<button type="button" value={specialization} className={style} disabled={disable}
								onClick={onClick}>
							{specs[specialization].name}
						</button>
					</div>
				);
			});

			return (
				<div key={careerIndex} className="row">
					<div className="col-sm-3">{career.name}</div>
					{cells}
				</div>
			);
		});

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
						<label htmlFor={"char-" + index}>{item.name} <small>[{item.abbr}]</small></label>
						<input type="number" className="form-control input-lg" id={"char-" + index}  defaultValue={minValue}
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
		var chars = this.props.characteristics;
		var COLS = 2;
		var width = 12 / COLS;
		var allSkills = [];
		for (var i = 0; i < COLS; i++) {
			var skills = this.props.skills.
				filter(function(item, index) { return (index % COLS === i); }).
				map(function(item, index) {
					return (
						<tr key={index}>
							<td>{item.name} <small>[{chars[item.chr].abbr}]</small> </td>
							<td>
								<input type="number"
									className="form-control input-sm input-sm"
									id={'skill-' + index}
									min="0" max="5" defaultValue="0" />
							</td>
							<td> YGG </td>
						</tr>
					);
			});
			allSkills.push(
				<div key={i} className={'col-sm-' + width}>
					<table className="table table-condensed form-horizontal">
						<thead>
							<tr>
								<th>Skill <small>[Char.]</small> </th>
								<th>Value</th>
								<th>Roll</th>
							</tr>
						</thead>
						<tbody>
							{skills}
						</tbody>
					</table>
				</div>
			);
		}
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title"> Skills </h3>
				</div>
				<div className="panel-body">
					<div className="row">
						{allSkills}
					</div>
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
