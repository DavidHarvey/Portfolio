<?php
//Required stuff
if (empty($_POST['email']) || empty($_POST['body'])) {
	return;
}

$email = $_POST['email'];
$body = $_POST['body'];
$name = (isset($_POST['name']) && !empty($_POST['name']) ? $_POST['name'] : 'Unknown');

//Is email an email?
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
	return;
}

//Is body long enough?
if (strlen($body) < 5) {
	return;
}

require 'PHPMailer/PHPMailerAutoload.php';
$mail = new PHPMailer;

$mail->isMail();

$mail->From = 'contact@dharveydev.com';
$mail->FromName = 'Automailer';
$mail->addAddress('david@dharveydev.com', 'David Harvey');
$mail->addReplyTo($email, $name);

$mail->WordWrap = 50;
$mail->isHTML(true);

$mail->Subject = 'Automated portfolio contact email: '.$email;
$mail->Body = $body;

if(!$mail->send()) {
    echo 'Oh no! There was an error sending your email, please try again.';
    //echo 'Mailer Error: ' . $mail->ErrorInfo;
} else {
    echo 'Your message has been sent! I will get back to you shortly.';
}
?>