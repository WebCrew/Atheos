/*jshint esversion: 6 */

//////////////////////////////////////////////////////////////////////////////80
// Settings Init
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) Atheos & Liam Siira (Atheos.io), distributed as-is and without
// warranty under the modified License: MIT - Hippocratic 1.2: firstdonoharm.dev
// See [root]/license.md for more. This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	var atheos = global.atheos,
		ajax = global.ajax,
		amplify = global.amplify,
		oX = global.onyx,
		storage = atheos.storage;

	var self = null;

	atheos.settings = {

		controller: 'components/settings/controller.php',
		dialog: 'components/settings/dialog.php',

		//////////////////////////////////////////////////////////////////////80
		// Initilization
		//////////////////////////////////////////////////////////////////////80
		init: function() {
			self = this;
			/*
				*  Storage Event:
				*  Note: Event fires only if change was made in different window and not in this one
				*  Details: http://dev.w3.org/html5/webstorage/#dom-localstorage
				*  Reason: If a user has multiple Atheos windows open, all using the same local storage,
				*  	and makes settings changes, using an iFrame will allow Atheos to detect those
				*		changes. I think. It doesn't exactly make sense honestly, but that's my only guess.
				*  
				*  Workaround for Storage-Event:
				*/
			oX('body').append('<iframe src="components/settings/dialog.php?action=iframe"></iframe>');


			// oX('#settings_open').on('click', function() {
			// 	atheos.settings.show();
			// });

			self.load();
		},

		//////////////////////////////////////////////////////////////////////80
		// Load Settings
		//////////////////////////////////////////////////////////////////////80
		load: function() {
			echo({
				url: self.controller,
				data: {
					action: 'load',
				},
				success: function(reply) {
					if (reply.status === 'success') {
						delete reply.status;
						for (var key in reply) {
							storage(key, reply[key]);
						}
					}
					amplify.publish('settings.loaded', reply);
				}
			});
		},

		//////////////////////////////////////////////////////////////////////80
		// Load Settings of Specific Tab
		//////////////////////////////////////////////////////////////////////80
		loadTabValues: function() {
			var children = oX('.settings panel').findAll('[data-setting]');
			children.forEach(function(child) {
				var key = oX(child).attr('data-setting'),
					type = child.type,
					value = storage(key);

				if (value === null) {
					return;
				}

				log(type);

				if (type === 'radio') {
					if (child.value() === value.toString()) {
						child.prop('checked', true);
					}
				} else if (type === 'checkbox') {
					child.prop('checked', value);
				} else {
					child.value(value);
				}
			});
		},

		publish: function(setting, value) {
			var boolean = (value === 'true');
			var int = (!isNaN(parseFloat(value)) && isFinite(value)) ? parseInt(value, 10) : 0;

			if (value === null) {
				atheos.toast.alert('You Must Choose A Value');
				return;
			}

			switch (setting) {
				case 'active.loopBehavior':
					atheos.active.loopBehavior = value;
					break;
				case 'editor.theme':
					atheos.editor.setTheme(value);
					break;
				case 'editor.fontSize':
					atheos.editor.setFontSize(value);
					break;
				case 'editor.highlightLine':
					atheos.editor.setHighlightLine(value);
					break;
				case 'editor.indentGuides':
					atheos.editor.setIndentGuides(boolean);
					break;
				case 'editor.printMargin':
					atheos.editor.setPrintMargin(boolean);
					break;
				case 'editor.printMarginColumn':
					atheos.editor.setPrintMarginColumn(int);
					break;
				case 'editor.wrapMode':
					atheos.editor.setWrapMode(boolean);
					break;
				case 'filemanager.showHidden':
					if (atheos.filemanager.showHidden !== value) {
						atheos.filemanager.showHidden = boolean;
						atheos.filemanager.rescan();
					}
					break;
				case 'filemanager.openTrigger':
					atheos.filemanager.openTrigger = value;
					break;
				case 'project.openTrigger':
					atheos.project.openTrigger = value;
					break;
				case 'sidebars.leftTrigger':
					atheos.sidebars.leftTrigger = value;
					break;
				case 'sidebars.rightTrigger':
					atheos.sidebars.rightTrigger = value;
					break;
				case 'editor.softTabs':
					atheos.editor.setSoftTabs(boolean);
					break;
				case 'editor.tabSize':
					atheos.editor.setTabSize(value);
					break;
			}
		},

		//////////////////////////////////////////////////////////////////////80
		// Save Settings
		//////////////////////////////////////////////////////////////////////80
		save: function(key, value, hidden) {
			if (!key || (typeof(value) === 'undefined')) {
				return;
			}

			echo({
				url: self.controller,
				data: {
					action: 'save',
					key,
					value
				},
				success: function(reply) {
					if (reply.status === 'error') {
						atheos.toast.show(reply);
					} else if (!hidden) {
						reply.text = 'Setting "' + key + '" saved.';
						// self.displayStatus(reply);
						atheos.toast.show(reply);
					}
				}
			});

			amplify.publish('settings.save');
		},

		//////////////////////////////////////////////////////////////////////80
		// Save Settings
		//////////////////////////////////////////////////////////////////////80
		saveAll: function(key, value, hidden) {
			var children = oX('.settings panel').findAll('[data-setting]');
			children.forEach(function(child) {
				var key = oX(child).attr('data-setting'),
					value = storage(key);

				if (value === null) {
					return;
				}

				if (child.el.type === 'radio' || child.el.type === 'checkbox') {
					if (child.value() === value.toString()) {
						child.prop('checked', true);
					}
				} else {
					child.value(value);

				}
			});

			echo({
				url: self.controller,
				data: {
					action: 'save',
					key,
					value
				},
				success: function(reply) {
					if (reply.status === 'error') {
						atheos.toast.show(reply);
					} else if (!hidden) {
						reply.text = 'Setting "' + key + '" saved.';
						self.displayStatus(reply);
					}
				}
			});

			amplify.publish('settings.save');
		},

		//////////////////////////////////////////////////////////////////////80
		// Display Save Status
		//////////////////////////////////////////////////////////////////////80
		displayStatus: debounce(function(reply) {
			atheos.toast.show(reply);
		}, 1000),

		//////////////////////////////////////////////////////////////////////80
		// Show Setting Dialog
		//////////////////////////////////////////////////////////////////////80
		show: function(dataFile) {
			var listener = function() {
				oX('#modal_wrapper').on('change', function(e) {
					var target = oX(e.target);
					var tagName = target.el.tagName;
					var type = target.el.type;

					var key = target.attr('data-setting'),
						value;

					if (tagName === 'SELECT') {
						value = target.value();

					} else if (tagName === 'INPUT' && type === 'checkbox') {
						value = target.prop('checked');

					} else if (tagName === 'INPUT' && type === 'radio') {
						value = target.value();

					} else {
						return;
					}

					storage(key, value);
					self.save(key, value);
					self.publish(key, value);
				});

				oX('.settings menu').on('click', function(e) {
					var target = oX(e.target);
					var tagName = target.el.tagName;
					if (tagName === 'A') {
						self.showTab(target.attr('data-file'));
					}
				});

				if (typeof(dataFile) === 'string') {
					self.showTab(dataFile);
				} else {
					self.loadTabValues();
				}
			};

			atheos.modal.load(800, self.dialog, {
				action: 'settings'
			}, listener);
		},

		//////////////////////////////////////////////////////////////////////80
		// Show Datafile Tab
		//////////////////////////////////////////////////////////////////////80
		showTab: function(dataFile) {
			if (typeof(dataFile) !== 'string') {
				return;
			}
			self.save(false);

			echo({
				url: dataFile,
				success: function(reply) {

					oX('.settings menu .active').removeClass('active');
					oX('.settings menu a[data-file="' + dataFile + '"]').addClass('active');
					oX('.settings panel').html(reply);

					self.loadTabValues(dataFile);
				}
			});
		}

	};

})(this);