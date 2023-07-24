import getAuthentication from '@salesforce/apex/AWSS3Controller.getAuthenticationData';


const configAWS= (renderFlag,)=>{
    if (this.renderFlag == true) {
        getAuthentication({})
            .then(result => {
                if (result) {
                    let metadataRecs = JSON.parse(JSON.stringify(result));
                    metadataRecs && metadataRecs.forEach(rec => {
                        (rec["DeveloperName"] == 'region') && (this.region = rec["Rhythm__Value__c"]);
                        (rec["DeveloperName"] == 'accessKey') && (this.accessKey = rec["Rhythm__Value__c"]);
                        (rec["DeveloperName"] == 'secretKey') && (this.secretKey = rec["Rhythm__Value__c"]);
                        (rec["DeveloperName"] == 's3bucket') && (this.bucketName = rec["Rhythm__Value__c"]);
                        (rec["DeveloperName"] == 'endpoint') && (this.endpoint = rec["Rhythm__Value__c"]);
                    });
                    const AWS = window.AWS;
                    AWS.config.update({
                        accessKeyId: this.accessKey,//Assigning access key id
                        secretAccessKey: this.secretKey,//Assigning secret access key
                        region_config: this.region
                    });
                    this.s3 = new AWS.S3({
                        params: {
                            Bucket: this.bucketName //Assigning S3 bucket name
                        }
                    });
                    this.renderFlag = false;
                    this.retrieveFilesFromS3();
                }
            });
    }
    else {
        this.retrieveFilesFromS3();
    }
}

async retriveFiles(){
     retrieveFilesFromS3() {
        const folderName = this.objectApiName + '/' + this.recordId + '/';
        this.s3.listObjects({ Bucket: this.bucketName, Prefix: folderName }, (err, data) => {
            if (err) {
                console.error(err);
            } else {
                const files = data.Contents;
                let fileList = [];
                this.keyList = [];
                files && files.forEach(file => {
                    const objectKey = file.Key;
                    fileList.push({ key: objectKey, url: this.endpoint + '/' + objectKey, value: objectKey.substring(objectKey.lastIndexOf("/") + 1) });
                });
                this.keyList = fileList.reverse();
                if (this.keyList.length != 0) {
                    this.getFilesFlag = true;
                }
                else {
                    this.getFilesFlag = false;
                }
            }
        });
    }
}
