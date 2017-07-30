const AWS = require('aws-sdk');
const sinon = require('sinon');

module.exports = {
	ec2: {      
        describeInstances: () => {
			    // Do nothing
        },
        stopInstances: () => {
			    // Do nothing
        }
	}
};

sinon.stub(AWS, 'EC2').returns(module.exports.ec2);
