'use strict';

/**
 * AWS Lambda function that stop/start aws servers
 * @author Amr Reda <amrreda@outlook.com>
 * @since 30 Jul. 2017
 */

// module dependencies
const AWS = require('aws-sdk');
const pify = require('pify');
const Promise = require('pinkie-promise');

const ec2 = new AWS.EC2();

/**
 * The handler function.
 * @param {object}  event		The data regarding the event.
 * @param {object}  context		The AWS Lambda execution context.
 */
exports.handler = function (event, context) {
	const describeParams = {
		Filters: [
			{
				Name: 'tag:DevServer',
				Values: [
					context.functionName
				]
			}
		]
	};

	// Describe the instances
	pify(ec2.describeInstances.bind(ec2), Promise)(describeParams)
		.then(data => {
			const stopParams = {
				InstanceIds: []
			};

			data.Reservations.forEach(reservation => {
				reservation.Instances.forEach(instance => {
					if (instance.State.Code === 16) {
						// 0: pending, 16: running, 32: shutting-down, 48: terminated, 64: stopping, 80: stopped
						stopParams.InstanceIds.push(instance.InstanceId);
					}
				});
			});

			if (stopParams.InstanceIds.length > 0) {
				// Stop the instances
				return pify(ec2.stopInstances.bind(ec2), Promise)(stopParams);
			}
		})
		.then(context.succeed)
		.catch(context.fail);
};
