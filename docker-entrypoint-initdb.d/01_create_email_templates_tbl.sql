CREATE TABLE `email_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `auth_type` varchar(100) NOT NULL,
  `template_name` varchar(100) NOT NULL,
  `subject_template` text NOT NULL,
  `body_template` text NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed data from utils/init_auth_tables.py.
INSERT IGNORE INTO `email_templates` (
  `id`, `auth_type`, `template_name`, `subject_template`, `body_template`
) VALUES
(
  1,
  'panelsearch_nanbyo',
  'auth_request',
  'Please verify your email address at PubCaseFinder Panelsearch(nanbyo)',
  'Hello {name},

Welcome to our service!
To complete the registration process and verify your email address, please click on the following link:

{link}

Once you have clicked the link, you will be redirected to our website where you can complete the authentication process.

If you did not sign up for our service, please ignore this email.

Best regards,
PubCaseFinder.dbcls.ac.jp
'
),
(
  2,
  'panelsearch_nanbyo',
  'accept',
  'Finished registration to Pubcasefinder PanelSearch(nanbyo)!',
  'Hello {name},

Thank you for signing up for our service.
Your registration was successfully completed.
Please click on the following link to start your tour :

{server}

Best regards,
PubCaseFinder.dbcls.ac.jp
'
),
(
  3,
  'panelsearch_nanbyo',
  'reject',
  'Failed registration to Pubcasefinder panelsearch(nanbyo)!',
  'Hello {name},

Sorry to inform you that your registration was failed.

Best regards,
PubCaseFinder.dbcls.ac.jp
'
),
(
  4,
  'pubcasefinder',
  'auth_request',
  'Please verify your email address at PubCaseFinder',
  'Hello {name},

Welcome to our service!
To complete the registration process and verify your email address, please click on the following link:

{link}

Once you have clicked the link, you will be redirected to our website where you can complete the authentication process.

If you did not sign up for our service, please ignore this email.

Best regards,
PubCaseFinder.dbcls.ac.jp
'
),
(
  5,
  'pubcasefinder',
  'accept',
  'Finished registration to Pubcasefinder!',
  'Hello {name},

Thank you for signing up for our service.
Your registration was successfully completed.
Please click on the following link to start your tour :

{server}

Best regards,
PubCaseFinder.dbcls.ac.jp
'
),
(
  6,
  'pubcasefinder',
  'reject',
  'Failed registration to Pubcasefinder!',
  'Hello {name},

        Thank you for signing up for our service.
Sorry to inform you that your registration was failed.

Best regards,
PubCaseFinder.dbcls.ac.jp
'
),
(
  7,
  'panelsearch_nanbyo',
  'fail',
  'Failed registration to Pubcasefinder panelsearch(nanbyo)!',
  'Hello {name},

Thank you for signing up for our service.
Sorry to inform you that your registration was failed due to following reason:

------
{fail_reason}
------

Best regards,
PubCaseFinder.dbcls.ac.jp
'
),
(
  8,
  'pubcasefinder',
  'fail',
  'Failed registration to Pubcasefinder panelsearch(nanbyo)!',
  'Hello {name},

Thank you for signing up for our service.
Sorry to inform you that your registration was failed due to following reason:

------
{fail_reason}
------

Best regards,
PubCaseFinder.dbcls.ac.jp
'
),
(
  9,
  'panelsearch_nanbyo',
  'invite_to_group',
  'Please sign up and join this group!',
  'Hello  {user_name},

Please join 「{group_title}」

Regist Pubcasefinder Panelsearch(nanbyo) at following:

{GOOGLE_FORM_URL}

Best regards,
PubCaseFinder.dbcls.ac.jp
'
),
(
  10,
  'panelsearch_nanbyo',
  'block',
  'Your Account Has Been Blocked',
  'Hello {name},

We would like to inform you that your account has been blocked and is no longer able to log in to Pubcasefinder(nanbyo).

Thank you for your understanding.

Kind regards,

PubCaseFinder(Nanbyo)
'
),
(
  11,
  'panelsearch_nanbyo',
  'restore',
  'Your Account Has Been Restored',
  'Hello {name},

We are pleased to inform you that your account has been restored and you can now log in to Pubcasefinder(nanbyo) again.

You may sign in using your existing account credentials.\n\nThank you for your patience and understanding.

Kind regards,

PubCaseFinder(Nanbyo)
'
),
(
  12,
  'pubcasefinder',
  'block',
  'Your Account Has Been Blocked',
  'Hello {name},

We would like to inform you that your account has been blocked and is no longer able to log in to Pubcasefinder.

Thank you for your understanding.

Kind regards,

PubCaseFinder
'
),
(
  13,
  'pubcasefinder',
  'restore',
  'Your Account Has Been Restored',
  'Hello {name},

We are pleased to inform you that your account has been restored and you can now log in to Pubcasefinder again.

You may sign in using your existing account credentials.

Thank you for your patience and understanding.

Kind regards,

PubCaseFinder
'
);
