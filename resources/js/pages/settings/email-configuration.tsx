import { Head, useForm, usePage } from '@inertiajs/react';
import React, { FormEvent } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { edit as editEmailConfig } from '@/routes/email-configuration';
import { testSmtp, testImap, update } from '@/actions/App/Http/Controllers/Settings/EmailConfigurationController';

interface EmailSettingData {
    id?: number;
    smtp_host?: string;
    smtp_port?: number;
    smtp_encryption?: string;
    smtp_username?: string;
    smtp_password?: string;
    from_address?: string;
    from_name?: string;
    has_smtp_password?: boolean;
    imap_host?: string;
    imap_port?: number;
    imap_encryption?: string;
    imap_username?: string;
    imap_password?: string;
    imap_validate_cert?: boolean;
    has_imap_password?: boolean;
}

interface PageProps {
    setting: EmailSettingData | null;
    status?: string;
    smtp_test_result?: { success: boolean; message: string };
    imap_test_result?: { success: boolean; message: string };
}

export default function EmailConfiguration({ setting, status, smtp_test_result, imap_test_result }: PageProps) {
    const { data, setData, patch, processing, errors } = useForm({
        smtp_host: setting?.smtp_host ?? '',
        smtp_port: setting?.smtp_port ?? 587,
        smtp_encryption: setting?.smtp_encryption ?? 'tls',
        smtp_username: setting?.smtp_username ?? '',
        smtp_password: setting?.smtp_password ?? '',
        from_address: setting?.from_address ?? '',
        from_name: setting?.from_name ?? '',

        imap_host: setting?.imap_host ?? '',
        imap_port: setting?.imap_port ?? 993,
        imap_encryption: setting?.imap_encryption ?? 'ssl',
        imap_username: setting?.imap_username ?? '',
        imap_password: setting?.imap_password ?? '',
        imap_validate_cert: setting?.imap_validate_cert ?? true,
    });

    const smtpForm = useForm({
        smtp_host: data.smtp_host,
        smtp_port: data.smtp_port,
        smtp_encryption: data.smtp_encryption,
        smtp_username: data.smtp_username,
        smtp_password: data.smtp_password,
    });

    const imapForm = useForm({
        imap_host: data.imap_host,
        imap_port: data.imap_port,
        imap_encryption: data.imap_encryption,
        imap_username: data.imap_username,
        imap_password: data.imap_password,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        patch(update.url(), {
            preserveScroll: true,
        });
    };

    const handleTestSmtp = () => {
        smtpForm.setData({
            smtp_host: data.smtp_host,
            smtp_port: data.smtp_port,
            smtp_encryption: data.smtp_encryption,
            smtp_username: data.smtp_username,
            smtp_password: data.smtp_password,
        });

        smtpForm.post(testSmtp.url(), {
            preserveScroll: true,
        });
    };

    const handleTestImap = () => {
        imapForm.setData({
            imap_host: data.imap_host,
            imap_port: data.imap_port,
            imap_encryption: data.imap_encryption,
            imap_username: data.imap_username,
            imap_password: data.imap_password,
        });

        imapForm.post(testImap.url(), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Email Configuration" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Email Configuration"
                    description="Configure SMTP for sending outbound emails and IMAP for receiving inbound emails."
                />

                {status === 'email-configuration-updated' && (
                    <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/30">
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                            Email configuration settings saved successfully.
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* SMTP Configuration Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">SMTP Settings (Outbound)</CardTitle>
                            <CardDescription>
                                Configure the outgoing mail server used to dispatch notifications and system emails.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {smtp_test_result && (
                                <div
                                    className={`rounded-md p-3 text-sm ${
                                        smtp_test_result.success
                                            ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    }`}
                                >
                                    {smtp_test_result.message}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="smtp_host">SMTP Host</Label>
                                    <Input
                                        id="smtp_host"
                                        placeholder="e.g. smtp.mailgun.org"
                                        value={data.smtp_host}
                                        onChange={(e) => setData('smtp_host', e.target.value)}
                                    />
                                    <InputError message={errors.smtp_host} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="smtp_port">SMTP Port</Label>
                                    <Input
                                        id="smtp_port"
                                        type="number"
                                        placeholder="587"
                                        value={data.smtp_port}
                                        onChange={(e) => setData('smtp_port', Number(e.target.value))}
                                    />
                                    <InputError message={errors.smtp_port} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="smtp_encryption">Encryption</Label>
                                    <Select
                                        value={data.smtp_encryption}
                                        onValueChange={(val) => setData('smtp_encryption', val)}
                                    >
                                        <SelectTrigger id="smtp_encryption">
                                            <SelectValue placeholder="Select encryption" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tls">TLS</SelectItem>
                                            <SelectItem value="ssl">SSL</SelectItem>
                                            <SelectItem value="none">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.smtp_encryption} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="smtp_username">SMTP Username</Label>
                                    <Input
                                        id="smtp_username"
                                        placeholder="user@domain.com"
                                        value={data.smtp_username}
                                        onChange={(e) => setData('smtp_username', e.target.value)}
                                    />
                                    <InputError message={errors.smtp_username} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="smtp_password">
                                    SMTP Password{' '}
                                    {setting?.has_smtp_password && (
                                        <span className="text-xs font-normal text-muted-foreground">
                                            (Leave blank to keep existing password)
                                        </span>
                                    )}
                                </Label>
                                <PasswordInput
                                    id="smtp_password"
                                    placeholder={setting?.has_smtp_password ? '••••••••' : 'Password'}
                                    value={data.smtp_password}
                                    onChange={(e) => setData('smtp_password', e.target.value)}
                                />
                                <InputError message={errors.smtp_password} />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="from_address">From Address</Label>
                                    <Input
                                        id="from_address"
                                        type="email"
                                        placeholder="noreply@example.com"
                                        value={data.from_address}
                                        onChange={(e) => setData('from_address', e.target.value)}
                                    />
                                    <InputError message={errors.from_address} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="from_name">From Name</Label>
                                    <Input
                                        id="from_name"
                                        placeholder="Platform System"
                                        value={data.from_name}
                                        onChange={(e) => setData('from_name', e.target.value)}
                                    />
                                    <InputError message={errors.from_name} />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={smtpForm.processing || !data.smtp_host}
                                    onClick={handleTestSmtp}
                                >
                                    {smtpForm.processing && <Spinner className="mr-2 h-4 w-4" />}
                                    Test SMTP Connection
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* IMAP Configuration Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">IMAP Settings (Inbound)</CardTitle>
                            <CardDescription>
                                Configure the incoming mail server for receiving messages and mailbox integration.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {imap_test_result && (
                                <div
                                    className={`rounded-md p-3 text-sm ${
                                        imap_test_result.success
                                            ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    }`}
                                >
                                    {imap_test_result.message}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="imap_host">IMAP Host</Label>
                                    <Input
                                        id="imap_host"
                                        placeholder="e.g. imap.gmail.com"
                                        value={data.imap_host}
                                        onChange={(e) => setData('imap_host', e.target.value)}
                                    />
                                    <InputError message={errors.imap_host} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="imap_port">IMAP Port</Label>
                                    <Input
                                        id="imap_port"
                                        type="number"
                                        placeholder="993"
                                        value={data.imap_port}
                                        onChange={(e) => setData('imap_port', Number(e.target.value))}
                                    />
                                    <InputError message={errors.imap_port} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="imap_encryption">Encryption</Label>
                                    <Select
                                        value={data.imap_encryption}
                                        onValueChange={(val) => setData('imap_encryption', val)}
                                    >
                                        <SelectTrigger id="imap_encryption">
                                            <SelectValue placeholder="Select encryption" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ssl">SSL</SelectItem>
                                            <SelectItem value="tls">TLS</SelectItem>
                                            <SelectItem value="none">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.imap_encryption} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="imap_username">IMAP Username</Label>
                                    <Input
                                        id="imap_username"
                                        placeholder="user@domain.com"
                                        value={data.imap_username}
                                        onChange={(e) => setData('imap_username', e.target.value)}
                                    />
                                    <InputError message={errors.imap_username} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="imap_password">
                                    IMAP Password{' '}
                                    {setting?.has_imap_password && (
                                        <span className="text-xs font-normal text-muted-foreground">
                                            (Leave blank to keep existing password)
                                        </span>
                                    )}
                                </Label>
                                <PasswordInput
                                    id="imap_password"
                                    placeholder={setting?.has_imap_password ? '••••••••' : 'Password'}
                                    value={data.imap_password}
                                    onChange={(e) => setData('imap_password', e.target.value)}
                                />
                                <InputError message={errors.imap_password} />
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                    id="imap_validate_cert"
                                    checked={data.imap_validate_cert}
                                    onCheckedChange={(checked) => setData('imap_validate_cert', Boolean(checked))}
                                />
                                <Label htmlFor="imap_validate_cert" className="text-sm font-normal">
                                    Validate SSL Certificate
                                </Label>
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={imapForm.processing || !data.imap_host}
                                    onClick={handleTestImap}
                                >
                                    {imapForm.processing && <Spinner className="mr-2 h-4 w-4" />}
                                    Test IMAP Connection
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner className="mr-2 h-4 w-4" />}
                            Save Email Configuration
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

EmailConfiguration.layout = {
    breadcrumbs: [
        {
            title: 'Email Configuration',
            href: editEmailConfig(),
        },
    ],
};
