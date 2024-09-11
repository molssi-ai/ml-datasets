
/* Formatting function for row details - modify as you need */
function format_details(data) {
	// `data` is the original data object for the row

	var details = $('.ds_details_template').clone();
	details.removeClass('ds_details_template');

	details.find('.description').append(data.description);
	details.find('.elements')
		.append(format_elements(data.elements, null, null, null, true));

	citations = '<ul>';
	for (var i in data.citations) {
		citations += '<li>' + data.citations[i].acs_citation;

		if (data.citations[i].url)
			citations += ' <a target="_blank" href="' + data.citations[i].url + '">'
				+ data.citations[i].url + '</a>';

		citations += '</li>';
	}
	citations += '</ul>';
	details.find('.citations').append(citations);

	labels = '';
	for (var key in data.labels) {
		labels += '<span class="badge badge-success mr-1">' + data.labels[key] + '</span>';
	}
	details.find('.labels').append(labels);

	tags = '';
	for (var key in data.tags) {
		tags += '<span class="badge badge-warning mr-1">' + data.tags[key] + '</span>';
	}
	details.find('.tags').append(tags);

	return details;
}

function format_buttons(data, type, row, meta) {
	if (!data.view_url_hdf5 && !data.view_url_plaintext) {
		return ''; // Return an empty string if there are no download links
	}

	var dropdownId = 'dropdown-' + meta.row;
	var dropdown = $('<div class="dropdown"></div>');
	var button = $('<button class="btn btn-link dropdown-toggle" type="button" id="' + dropdownId + '" data-bs-toggle="dropdown" aria-expanded="false">Download</button>');
	var menu = $('<ul class="dropdown-menu" aria-labelledby="' + dropdownId + '"></ul>');

	if (data.view_url_hdf5) {
		menu.append('<li><a class="dropdown-item" href="' + data.view_url_hdf5 + '" target="_blank" rel="noopener">HDF5 (' + data.hdf5_size + ' MB)</a></li>');
	}

	if (data.view_url_plaintext) {
		menu.append('<li><a class="dropdown-item" href="' + data.view_url_plaintext + '" target="_blank" rel="noopener">Text (' + data.plaintext_size + ' MB)</a></li>');
	}

	dropdown.append(button).append(menu);
	return dropdown[0].outerHTML;
}

function format_elements(data, type, row, meta, full) {

	out = '';
	for (var i in data) {
		if (!full & i == 5) {
			out += ' ...';
			break;
		}

		var ele = '';
		if (window.jmol_colors) {
			var style = 'style="background-color: ' + window.jmol_colors[data[i]] + '"';
			ele = '<span class="badge mr-1"'
				+ style + '>'
				+ data[i] + '</span>';
		} else {
			if (i > 0)
				ele += ', ';
			ele += data[i];
		}
		out += ele;
	}

	return out;
}

$(document).ready(function () {

	$.ajax({
		url: './jmol_colors.json',
		async: false,
		timeout: 1000,  // msec
	}).done(function (data) {
		window.jmol_colors = data;
	});

	var table = $('#ds_table').DataTable({

		// dom: 'f <"toolbar"> r <t> i p',  
		layout: {
			topStart: function () {
				let toolbar = document.createElement('div');
				toolbar.className = 'toolbar';
				return toolbar;
			},
			topEnd: 'search',
			bottomStart: 'info',
			bottomEnd: 'paging'
		},
		// searching: true,
		pageLength: 12,
		ordering: true,
		// paging: true,
		order: [[1, 'asc']], // column #1
		//compact: true,  // styles classes not here

		"ajax": "datasets.json",

		"columns": [
			{   // expand button
				"className": 'details-control',
				"orderable": false,
				"data": null,
				"defaultContent": ''
			},
			{ title: "Name", data: "name" },
			{ title: "Quality", data: "theory_level" },
			{ title: "Data Points", data: "data_points", className: "numeric" },
			{ title: "Elements", data: "elements", render: format_elements, className: "elements-cell" },
			{ title: "Sampling", data: "sampling" },
			{
				"title": "Download",
				"targets": -1,  // first col from right
				"data": null,   //pass the whole row to the render function
				"orderable": false,
				"className": "btns-cell",
				"render": format_buttons,
			}
		],

		"drawCallback": function (settings) {
			// Initialize dropdowns
			var dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
			var dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
				return new bootstrap.Dropdown(dropdownToggleEl);
			});
		},

	});

	$("div.toolbar").append(
		'<a id="add_your_ds" href="#">Add your Dataset</a>'
		+ '<a id="license" href="#">License</a>'
	);


	$('#ds_table tbody').on('click', 'a#hdf5', function (e) {
		var data = table.row($(this).parents('tr')).data();
	});

	$('#ds_table tbody').on('click', 'a#text', function (e) {
		var data = table.row($(this).parents('tr')).data();
	});


	// Add event listener for opening and closing details
	$('#ds_table tbody').on('click', 'td.details-control', function () {
		var tr = $(this).closest('tr');
		var row = table.row(tr);

		if (row.child.isShown()) {
			// This row is already open - close it
			row.child.hide();
			tr.removeClass('shown');
			tr.removeClass('light-gray-bg');
		}
		else {
			// Open this row
			row.child(format_details(row.data())).show();
			row.child().addClass('light-gray-bg');
			tr.addClass('light-gray-bg');
			tr.addClass('shown');

		}
	});


	$('#add_your_ds').click(function (e) {
		e.preventDefault();
		console.log('add your dataset clicked');
		var msg = "To add your Machine Learning Dataset, please "
			+ "email us at <a class='card-link' href='mailto:qcarchive@molssi.org'>qcarchive@molssi.org</a>.";

		$('#msg_dialog .modal-body p').html(msg);
		var myModal = new bootstrap.Modal(document.getElementById('msg_dialog'));
		myModal.show();
	});


	$('#license').click(function (e) {
		e.preventDefault();

		var msg = "All datasets are provided under the "
			+ "<a class='card-link' target='_blank' href='https://creativecommons.org/licenses/by/4.0/legalcode'>"
			+ "Creative Commons 4.0 Attribution </a> license.";

		$('#msg_dialog .modal-body p').html(msg);
		var myModal = new bootstrap.Modal(document.getElementById('msg_dialog'));
		myModal.show();

	});

});


