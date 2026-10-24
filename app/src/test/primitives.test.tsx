import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Button,
  Card,
  CardAside,
  Checkbox,
  Chip,
  FileInput,
  Kicker,
  RankList,
  RankRow,
  Section,
  Tab,
} from '../ui/primitives';

describe('Button', () => {
  it('defaults to the primary treatment and fires onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn).toHaveClass('bg-green', 'rounded-full', 'min-h-11');
    expect(btn).toHaveAttribute('type', 'button');
    await user.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('ghost variant carries the outline treatment', () => {
    render(<Button variant="ghost">Cancel</Button>);
    const btn = screen.getByRole('button', { name: 'Cancel' });
    expect(btn).toHaveClass('bg-transparent', 'border-white/25');
    expect(btn).not.toHaveClass('bg-green');
  });

  it('merges caller className overrides', () => {
    render(<Button className="self-center!">Centered</Button>);
    expect(screen.getByRole('button', { name: 'Centered' })).toHaveClass('self-center!');
  });
});

describe('Chip', () => {
  it('toggles aria-pressed and the active treatment', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [on, setOn] = React.useState(false);
      return (
        <Chip on={on} onClick={() => setOn((v) => !v)}>
          4 weeks
        </Chip>
      );
    }
    render(<Harness />);
    const chip = screen.getByRole('button', { name: '4 weeks' });
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    expect(chip).toHaveClass('bg-panel-2');
    expect(chip).not.toHaveClass('bg-green');
    await user.click(chip);
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    expect(chip).toHaveClass('bg-green', 'text-black');
    // same-group base utilities must be absent, or stylesheet order would decide
    expect(chip).not.toHaveClass('bg-panel-2');
    expect(chip).not.toHaveClass('text-txt');
  });
});

describe('Tab', () => {
  it('exposes pressed state and the on treatment only when active', () => {
    const { rerender } = render(<Tab on={false}>Journey</Tab>);
    const tab = screen.getByRole('button', { name: 'Journey' });
    expect(tab).toHaveAttribute('aria-pressed', 'false');
    expect(tab).toHaveClass('bg-transparent', 'text-txt-2');
    expect(tab).not.toHaveClass('bg-panel-2');
    rerender(<Tab on>Journey</Tab>);
    expect(tab).toHaveAttribute('aria-pressed', 'true');
    expect(tab).toHaveClass('bg-panel-2', 'text-txt');
    expect(tab).not.toHaveClass('bg-transparent');
    expect(tab).not.toHaveClass('text-txt-2');
  });
});

describe('Kicker', () => {
  it('renders the overline label', () => {
    render(<Kicker>Your year in listening</Kicker>);
    expect(screen.getByText('Your year in listening')).toHaveClass('uppercase', 'text-green');
  });
});

describe('Card', () => {
  it('renders the titled panel with a labelled section and entrance animation', () => {
    render(
      <Card id="stats-h" title="Stats" aside={<CardAside>4 weeks</CardAside>}>
        <p>body</p>
      </Card>,
    );
    const section = screen.getByText('body').closest('section');
    expect(section).toHaveAttribute('aria-labelledby', 'stats-h');
    expect(section).toHaveClass('bg-panel', 'rounded-2xl', 'animate-[tj-rise_.28s_ease-out_both]');
    expect(screen.getByRole('heading', { level: 3, name: 'Stats' })).toHaveAttribute('id', 'stats-h');
    expect(screen.getByText('4 weeks')).toHaveClass('text-txt-2');
  });

  it('renders non-text aside content raw, so controls stay interactive', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Card title="Chapters" aside={<Button onClick={onClick}>Play</Button>}>
        <p>body</p>
      </Card>,
    );
    await user.click(screen.getByRole('button', { name: 'Play' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('can opt out of the entrance animation and takes aria-label', () => {
    render(
      <Card label="Status" animated={false} role="status">
        <p>body</p>
      </Card>,
    );
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-label', 'Status');
    expect(el).not.toHaveClass('animate-[tj-rise_.28s_ease-out_both]');
  });

  it('renders no head row when neither title nor aside is given', () => {
    render(
      <Card label="plain">
        <p>body</p>
      </Card>,
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});

describe('Section', () => {
  it('renders title and aside with the labelled section landmark', () => {
    render(
      <Section id="era-h" title="Eras" aside="by month">
        <p>content</p>
      </Section>,
    );
    const section = screen.getByText('content').closest('section');
    expect(section).toHaveAttribute('aria-labelledby', 'era-h');
    expect(screen.getByRole('heading', { level: 3, name: 'Eras' })).toHaveAttribute('id', 'era-h');
    expect(screen.getByText('by month')).toBeInTheDocument();
    expect(section).toHaveClass('first-of-type:border-t-0', 'animate-[tj-rise_.28s_ease-out_both]');
  });
});

describe('RankList / RankRow', () => {
  it('renders an ordered list with rank, title, sub and value', () => {
    render(
      <RankList>
        <RankRow rank={1} thumb="red" title="Artist A" sub="most played: Song" value="120 min" />
      </RankList>,
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Artist A')).toBeInTheDocument();
    expect(screen.getByText('most played: Song')).toBeInTheDocument();
    expect(screen.getByText('120 min')).toBeInTheDocument();
  });
});

describe('Checkbox', () => {
  it('associates the label and toggles', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Top artists" checked={false} onChange={onChange} />);
    const box = screen.getByRole('checkbox', { name: 'Top artists' });
    expect(box).toHaveClass('accent-green');
    await user.click(box);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('FileInput', () => {
  it('stays visually hidden, accepts JSON, reports the chosen file and resets', () => {
    const onFiles = vi.fn();
    const ref = React.createRef<HTMLInputElement>();
    render(
      <FileInput inputRef={ref} onFiles={onFiles} label="Choose your Spotify streaming history JSON files" />,
    );
    const input = screen.getByLabelText('Choose your Spotify streaming history JSON files');
    expect(input).toHaveClass('absolute', 'h-px', 'w-px');
    expect(input).toHaveAttribute('accept', '.json,application/json');
    const file = new File(['{}'], 'history.json', { type: 'application/json' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onFiles).toHaveBeenCalledWith([file]);
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('allows picking several export files at once', () => {
    const onFiles = vi.fn();
    const ref = React.createRef<HTMLInputElement>();
    render(
      <FileInput inputRef={ref} onFiles={onFiles} label="Choose your Spotify streaming history JSON files" />,
    );
    const input = screen.getByLabelText('Choose your Spotify streaming history JSON files');
    expect(input).toHaveAttribute('multiple');
    const a = new File(['[]'], 'a.json', { type: 'application/json' });
    const b = new File(['[]'], 'b.json', { type: 'application/json' });
    fireEvent.change(input, { target: { files: [a, b] } });
    expect(onFiles).toHaveBeenCalledWith([a, b]);
  });
});
