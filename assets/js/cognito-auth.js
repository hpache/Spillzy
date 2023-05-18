var spillzy = window.spillzy || {};
(function scopeWrapper($){

    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _confg.cognito.userPoolClientId
    };

    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }

    spillzy.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        var cognitoUser = userPool.getCurrentUser();
        
        if (cognitoUser) {
            cognitoUser.getSession(function sessionCallback(err, session) {
                if (err) {
                    reject(err);
                } else if (!session.isValid()) {
                    resolve(null);
                } else {
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        } else {
            resolve(null);
        }
    });

    function createCognitoUser(username) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: username,
            Pool: userPool
        });
    }

    function signIn(username, password, onSuccess, onFailure){
        var authDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: username,
            Password: password
        });

        var cognitoUser = createCognitoUser(username);

        cognitoUser.authenticateUser(authDetails,{
            onSuccess: onSuccess,
            onFailure: onFailure
        })
    }

    function register(username, email, password, onSuccess, onFailure) {
        var dataEmail = {
            Name: 'email',
            Value: email
        };
        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

        userPool.signUp(username, password, [attributeEmail], null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            }
        );
    }

    function verify(username, code, onSuccess, onFailure) {
        createCognitoUser(username).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

    function handleSignIn(event){
        var username = $("#username").val();
        var password = $("#password").val();
        event.preventDefault();
        signIn(username, password, 
            function signInSuccess(){
                window.location.href = 'Videos.html'
            }, 
            function signInFailure(error){
                alert(error)
            }
        );
    }

    function handleRegister(event) {
        var email = $('#email').val();
        var username = $('#username').val();
        var password = $('#password').val();

        var onSuccess = function registerSuccess(result) {
            var cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            var confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
            if (confirmation) {
                window.location.href = 'verify.html';
            }
        };
        var onFailure = function registerFailure(err) {
            alert(err);
        };
        event.preventDefault();        
        register(username, email, password, onSuccess, onFailure);

    }

    function handleVerify(event) {
        var username = $('#username').val();
        var code = $('#verification').val();
        event.preventDefault();
        verify(username, code,
            function verifySuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully verified');
                alert('Verification successful. You will now be redirected to the login page.');
                window.location.href = 'signIn.html';
            },
            function verifyError(err) {
                alert(err);
            }
        );
    }

    $(function onDocReady(){
        $("#signInForm").submit(handleSignIn);
        $("#signUpForm").submit(handleRegister);
        $("#verifyForm").submit(handleVerify);
    });

}(jQuery));