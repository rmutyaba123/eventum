<?php

/*
 * This file is part of the Eventum (Issue Tracking System) package.
 *
 * @copyright (c) Eventum Team
 * @license GNU General Public License, version 2 or later (GPL-2+)
 *
 * For the full copyright and license information,
 * please see the COPYING and AUTHORS files
 * that were distributed with this source code.
 */

namespace Eventum\Test\Mail;

use Date_Helper;
use Eventum\Mail\MailMessage;
use Eventum\Test\TestCase;
use Mime_Helper;
use Support;

/**
 * Tests Mime_Decode so it could be dropped
 *
 * @see https://github.com/eventum/eventum/pull/256#issuecomment-300879398
 * @see Mime_Helper::decode()
 */
class MimeDecodeTest extends TestCase
{
    public function testEmptyMessage()
    {
        // test empty message
        $message = '';
        $res = Mime_Helper::decode($message, false, true);

        $this->assertMimeHelperResult($res);
    }

    public function testFieldValues()
    {
        $message = $this->readDataFile('bug684922.txt');
        $input = Mime_Helper::decode($message, false, true);
        $mail = MailMessage::createFromString($message);

        $this->assertEquals('"Some Guy" <abcd@origin.com>', $input->headers['from']);
        $this->assertEquals('Some Guy <abcd@origin.com>', $mail->from);

        $this->assertEquals('PD: My: Gołblahblah', $input->headers['subject']);
        $this->assertEquals('PD: My: Gołblahblah', $mail->subject);
    }

    public function testSupportBuildMail()
    {
        $issue_id = null;
        $from = 'rööts <me@localhost>';
        $reason = 'reason';
        $subject = 'Issue closed comments';
        $cc = '';
        $to = '';
        $mail = Support::buildMail(
            $issue_id, $from,
            $to, $cc, $subject, $reason, ''
        );

        $this->assertEquals($reason, $mail->getContent());
        $this->assertEquals($reason, $mail->getMessageBody());
        $this->assertEquals($from, $mail->from);
        $this->assertEquals('', $mail->to);
        $this->assertEquals('', $mail->cc);
        $this->assertEquals($subject, $mail->subject);

        // date header is in rfc822 format: 'Thu, 06 Jul 2017 16:43:46 GMT'
        // for sql insert we need iso8601 format: '2017-07-06 16:43:46'
        $date = Date_Helper::convertDateGMT($mail->getDate());
        $this->assertEquals(Date_Helper::getCurrentDateGMT(), $date);
    }

    /**
     * Test that $mail->getAttachments can be called if no attachments present
     *
     * @see Support::getEmailDetails()
     */
    public function testGetAttachments()
    {
        $content = $this->readDataFile('attachment-bug.txt');
        $mail = MailMessage::createFromString($content);
        $attachment = $mail->getAttachment();
        $this->assertTrue($attachment->hasAttachments());
        $attachments = $attachment->getAttachments();
        $this->assertContains('i cannot get any cursed header', $attachments[0]['blob']);
        $content = $mail->getMessageBody();
        $this->assertContains('i cannot get any cursed header', $content);
    }

    /**
     * Test usecase when Mime_Helper::decode is used only for headers array
     */
    public function testHeaders()
    {
        $message = $this->readDataFile('LP901653.txt');
        $res = Mime_Helper::decode($message, false, true);
        $this->assertMimeHelperResult($res);

        $ph = $res->headers;

        $mail = MailMessage::createFromString($message);
        $zh = $this->pearizeHeaders($mail->getHeadersArray());
        // these headers were manually verified
        unset($ph['from'], $zh['from']);
        unset($ph['to'], $zh['to']);
        unset($ph['content-type'], $zh['content-type']);

        $this->assertEquals($zh, $ph);
    }

    /**
     * Mime_Helper::decode()->body extracts main message body if no parts present
     */
    public function testBuildMail()
    {
        $issue_id = null;
        $from = 'Elan Ruusamäe <root@localhost>';
        $to = '';
        $cc = '';
        $subject = 'söme messidž';
        $body = "Hello, bödi tekst\n\nBye";
        $in_reply_to = '';
        $iaf_ids = [];

        $mail = Support::buildMail($issue_id, $from, $to, $cc, $subject, $body, $in_reply_to, $iaf_ids);
        $structure = Mime_Helper::decode($mail->getRawContent(), true, true);

        $this->assertEquals($body, $structure->body);
        $this->assertEquals($body, $mail->getMessageBody());
    }

    public function testBuildMailSave()
    {
        // this is mail saved by Support::buildMail
        $content = $this->readDataFile('saved_mail.txt');
        $mail = MailMessage::createFromString($content);
        $this->assertNotEmpty($mail);
    }

    /**
     * Hack out inconsistencies:
     *
     * - pear/mime_decode decodes empty headers as false, zf as ''
     * - pear/mime_decode lowercases headers array keys
     * - zf preserves line continuations
     * - MailMessage helper creates empty Cc: header
     * - zf sanitizes recipient headers
     */
    private function pearizeHeaders($h)
    {
        $headers = [];
        foreach ($h as $k => $v) {
            // strip spaces, irrelevant for test
            if (is_string($v)) {
                $v = preg_replace('/\s+/', ' ', $v);
            }
            if ($v === '') {
                $v = false;
            }
            $headers[strtolower($k)] = $v;
        }

        if ($headers['cc'] == false) {
            unset($headers['cc']);
        }

        return $headers;
    }

    private function assertMimeHelperResult($res)
    {
        $this->assertInstanceOf('stdClass', $res);
        $this->assertInternalType('array', $res->headers);
        $this->assertObjectHasAttribute('headers', $res);
        $this->assertObjectHasAttribute('ctype_primary', $res);
        $this->assertObjectHasAttribute('ctype_secondary', $res);
    }
}
