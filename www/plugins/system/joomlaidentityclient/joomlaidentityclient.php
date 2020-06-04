<?php
/**
 * @package     Joomla.Plugin
 * @subpackage  System.joomlaidentityclient
 *
 * @copyright   Copyright (C) 2005 - 2019 Open Source Matters, Inc. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\CMS\User\UserHelper;

defined('_JEXEC') or die;

/**
 * Joomla Identity Plugin class
 *
 * @since 1.0.0
 */
class PlgSystemJoomlaidentityclient extends CMSPlugin
{
	/**
	 * Application object.
	 *
	 * @var    CMSApplication
	 * @since  1.0.0
	 */
	protected $app;

	/**
	 * Database object.
	 *
	 * @var    JDatabaseDriverMysqli
	 * @since  1.0.0
	 */
	protected $db;

	/**
	 * Affects constructor behavior. If true, language files will be loaded automatically.
	 *
	 * @var    boolean
	 * @since  1.0.0
	 */
	protected $autoloadLanguage = true;

	/**
	 * Triggered before Joomla! renders the page
	 *
	 * @return  void
	 *
	 * @since   1.0.0
	 */
	public function onAfterRoute()
	{
		// Run on frontend only
		if ($this->app->isClient('administrator'))
		{
			return;
		}

		// Check for Joomla Identity
		$joomlaIdentity = $this->app->input->getBool('joomlaidp');

		// Only continue for Joomla Identity
		if (!isset($joomlaIdentity))
		{
			return;
		}

		JLog::addLogger(['text_file' => 'idp-calls.php'], JLog::ALL, ['idp']);
		JLog::add('Call received', JLog::INFO, 'idp');

		try
		{
			// Get the API key
			$apiKey = $this->params->get('apikey');

			// Check API key length
			if (strlen($apiKey) <> 36)
			{
			JLog::add(Text::_('PLG_SYSTEM_JOOMLAIDENTITYCLIENT_INVALID_APIKEY'), JLog::INFO, 'idp');
				throw new InvalidArgumentException(Text::_('PLG_SYSTEM_JOOMLAIDENTITYCLIENT_INVALID_APIKEY'));
			}

			// Get the payload
			$data = $this->app->input->get('data', '', 'raw');
			$hash = base64_decode($this->app->input->get('hash', '', 'base64'));

			// Validate the hash
			if ($hash !== hash_hmac('sha512', $data, $apiKey))
			{
				JLog::add(Text::_('PLG_SYSTEM_JOOMLAIDENTITYCLIENT_INVALID_HASH'), JLog::INFO, 'idp');
				throw new InvalidArgumentException(Text::_('PLG_SYSTEM_JOOMLAIDENTITYCLIENT_INVALID_HASH'));
			}

			JLog::add('Data: '. $data, JLog::INFO, 'idp');

			// Get the data
			$data     = json_decode($data);
			$guid     = $data->guid;
			$task     = $data->task;
			$userData = $data->userData;

			if (!$guid || strlen($guid) <> 36)
			{
				JLog::add(Text::_('PLG_SYSTEM_JOOMLAIDENTITYCLIENT_INVALID_GUID'), JLog::INFO, 'idp');
				throw new InvalidArgumentException(Text::_('PLG_SYSTEM_JOOMLAIDENTITYCLIENT_INVALID_GUID'));
			}

			if ($userData)
			{
				JLog::add(Text::_('processIdentity'), JLog::INFO, 'idp');
				$this->processIdentity($guid, $task, $userData);
			}
		}
		catch (Exception $exception)
		{
			echo $exception->getMessage();
		}

		// Since we decided to handle this request, we will close it as well
		$this->app->close();
	}

	/**
	 * Method to process the Joomla Identity data
	 *
	 * @param   string  $guid  The User ID
	 * @param   string  $task  The task
	 * @param   object  $data  Object containing user data
	 *
	 * @return  void
	 *
	 * @since   1.0.0
	 */
	protected function processIdentity($guid, $task, $data)
	{
		// Update the Joomla user
		$this->updateJoomlaUser($guid, $data->name, $data->email);

		// Get Joomla user ID
		$userId = (int) UserHelper::getUserId($guid);

		// Plugin trigger onProcessIdentity for site specific processing
		\JEventDispatcher::getInstance()->trigger('onProcessIdentity', array($userId, $guid, $task, $data));
	}

	/**
	 * Method to update the Joomla User
	 *
	 * @param   string  $username  Username (guid)
	 * @param   string  $name      Name of user
	 * @param   string  $email     Email of user
	 *
	 * @return  void
	 *
	 * @since   1.0.0
	 */
	protected function updateJoomlaUser($username, $name, $email)
	{
		// Consent date
		$user = (object) array(
			'username' => $username,
			'name'     => $name,
			'email'    => $email,
		);

		$this->db->updateObject('#__users', $user, 'username');
	}

	/**
	 * We prevent editing the user properties via the site itself
	 *
	 * @param   JForm $form The form to be altered.
	 * @param   mixed $data The associated data for the form.
	 *
	 * @return  boolean
	 *
	 * @since   1.0.0
	 */
	public function onContentPrepareForm($form, $data)
	{
		// Check we are manipulating a valid form.
		if (!in_array($form->getName(), array('com_admin.profile', 'com_users.user', 'com_users.profile', 'com_users.registration')))
		{
			return true;
		}

		// Disable editing the name, username, email, password and requireReset fields
		$form->setFieldAttribute('name', 'readonly', 'readonly');
		$form->setFieldAttribute('username', 'readonly', 'readonly');
		$form->setFieldAttribute('email', 'readonly', 'readonly');
		$form->setFieldAttribute('password', 'readonly', 'readonly');
		$form->setFieldAttribute('password2', 'readonly', 'readonly');
		$form->setFieldAttribute('requireReset', 'readonly', 'readonly');

		return true;
	}
}
