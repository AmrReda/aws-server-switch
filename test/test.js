import test from 'ava';
import pify from 'aws-lambda-pify';
import AWS from 'aws-sdk';
import sinon from 'sinon';
import index from '../';
import {ec2} from './stubs/ec2';
import * as data from './stubs/describeInstances.json';


const fn = pify(index.myHandler);


test.serial('filter the instances with the correct tag', async t => {   
    sinon.stub(ec2, 'describeInstances').yields(undefined, data.noReservations);
    sinon.stub(ec2, 'stopInstances').yields();

    try {
        await fn();

        t.true(ec2.describeInstances.callWith({
            Filters: [
                {
                    Name: 'tag:DevServer',
                    Value: [
                        'aws-lambda-mock-context'
                    ]
                }
            ]
        }));
    } finally {
        ec2.describeInstances.restore();
        ec2.stopInstances.restore();
    }
});

test.serial('no instances are stopped because reservations are empty', async t => {
    sinon.stub(ec2, 'describeInstances').yields(undefined, data.noReservations);
    sinon.stub(ec2, 'stopInstances').yields();

	try {
		await fn();

		t.true(ec2.stopInstances.notCalled);
	} finally {
		ec2.describeInstances.restore();
		ec2.stopInstances.restore();
	}
});

test.serial('stops only the running instances', async t => {
	sinon.stub(ec2, 'describeInstances').yields(undefined, data.multipleInstances);
	sinon.stub(ec2, 'stopInstances').yields();

	try {
		await fn();

		t.true(ec2.stopInstances.calledWith({
			InstanceIds: [
				'i-abc123',
				'i-ghi789'
			]
		}));
	} finally {
		ec2.describeInstances.restore();
		ec2.stopInstances.restore();
	}
});
